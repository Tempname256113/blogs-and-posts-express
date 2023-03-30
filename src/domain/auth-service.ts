import {RequestUserType, UserTypeExtended, UserTypeExtendedOptionalFields} from "../models/user-models";
import {createTransport} from "nodemailer";
import {v4 as uuidv4} from 'uuid';
import {add} from 'date-fns';
import {AuthRepository} from "../repositories/auth/auth-repository";
import {compare, hash} from "bcrypt";
import {UsersQueryRepository} from "../repositories/users/users-query-repository";
import {createNewPairOfTokens} from "../routes/application/jwt-methods";
import {DataForUpdateSessionType, SessionType} from "../models/session-models";
import {AuthQueryRepository} from "../repositories/auth/auth-query-repository";

const envVariables = {
    mailUser: process.env.MAIL_USER,
    mailPassword: process.env.MAIL_PASSWORD
}

type mailOptions = {
    from?: string,
    to: string,
    subject?: string,
    html?: string
}

type sessionDataType = {
    userLoginOrEmail: string,
    userPassword: string,
    userIp: string,
    userDeviceName: string
}

/* настраивает почтовый сервис и отправляет письмо с кодом подтверждения на почту клиента.
* обязательно нужно передать почтовый адрес клиента, другие настройки можно передавать при необходимости.
* если не передавать то дефолтные настройки подставятся сами.
* также нужно передать секретный код который будет интегрирован в ссылку письма для подтверждения */
const sendLinkWithSecretCodeToEmail = ({
                                                 from = `"Temp256113" <${envVariables.mailUser}>`,
                                                 to,
                                                 subject = "Confirm registration please",
                                                 html
                                             }: mailOptions,
                                             confirmationCode?: string): void => {
    const transporter = createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: envVariables.mailUser,
            pass: envVariables.mailPassword
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    if (!html) {
        html = ` <h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href=https://somesite.com/confirm-email?code=${confirmationCode}>complete registration</a>
      </p> `;
    }
    const mailOptions = {
        from,
        to,
        subject,
        html
    }
    transporter.sendMail(mailOptions);
}

const mailer = {
    sendLinkForCompleteRegistration(to: string, confirmationCode: string): void {
        sendLinkWithSecretCodeToEmail(
            {
                to,
                subject: 'Confirm registration please',
                html: ` <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                    <a href=https://somesite.com/confirm-email?code=${confirmationCode}>complete registration</a>
                </p> `
            }
        );
    },
    sendLinkForPasswordRecovery(to: string, confirmationCode: string): void {
        sendLinkWithSecretCodeToEmail(
            {
                to,
                subject: 'Password recovery link',
                html: ` <h1>Your link for password recovery is here</h1>
                <p>To password recovery please follow the link below:
                    <a href=https://somesite.com/password-recovery?recoveryCode=${confirmationCode}>recovery password</a>
                </p> `
            }
        );
    }
}

export class AuthService {
    constructor(
        protected authRepository: AuthRepository,
        protected usersQueryRepository: UsersQueryRepository,
        protected authQueryRepository: AuthQueryRepository
    ) {}
    async registrationNewUser({login, password, email}: RequestUserType): Promise<boolean> {
        const confirmationEmailCode: string = uuidv4();
        try {
            const passwordHash = await hash(password, 10);
            const newUser: UserTypeExtended = {
                id: uuidv4(),
                accountData: {
                    login,
                    email,
                    password: passwordHash,
                    createdAt: new Date().toISOString()
                },
                emailConfirmation: {
                    confirmationCode: confirmationEmailCode,
                    expirationDate: add(new Date, {days: 3}),
                    isConfirmed: false
                },
                passwordRecovery: {
                    recoveryCode: 'none'
                }
            }
            await this.authRepository.createNewUser(newUser);
            mailer.sendLinkForCompleteRegistration(email, confirmationEmailCode);
            return true;
        } catch (e) {
            return false;
        }
    };
    async confirmRegistration(emailConfirmCode: string): Promise<boolean> {
        const foundedUserByConfirmationEmailCode: UserTypeExtended | null = await this.usersQueryRepository.getUserByConfirmationEmailCode(emailConfirmCode);
        if (!foundedUserByConfirmationEmailCode) return false;
        if (foundedUserByConfirmationEmailCode.emailConfirmation.isConfirmed) return false;
        if (new Date() > foundedUserByConfirmationEmailCode.emailConfirmation.expirationDate) return false;
        const updateUserEmailConfirmationStatus = async (): Promise<void> => {
            const userId = foundedUserByConfirmationEmailCode.id;
            const templateForUpdateUser: UserTypeExtendedOptionalFields = {
                emailConfirmation: {
                    confirmationCode: null,
                    expirationDate: foundedUserByConfirmationEmailCode.emailConfirmation.expirationDate,
                    isConfirmed: true
                }
            };
            await this.authRepository.updateUserByID(userId, templateForUpdateUser);
        }
        await updateUserEmailConfirmationStatus();
        return true;
    };
    async resendSecretCodeToEmail(email: string): Promise<boolean> {
        const foundedUserByEmail: UserTypeExtended | null = await this.usersQueryRepository.getUserByEmail(email);
        if (!foundedUserByEmail) return false;
        if (foundedUserByEmail.emailConfirmation.isConfirmed) return false;
        try {
            const confirmationEmailCode: string = uuidv4();
            const updateUserEmailConfirmationStatus = async (): Promise<void> => {
                const userId = foundedUserByEmail.id;
                const templateForUpdateUser: UserTypeExtendedOptionalFields = {
                    emailConfirmation: {
                        confirmationCode: confirmationEmailCode,
                        expirationDate: add(new Date(), {days: 3}),
                        isConfirmed: false
                    }
                };
                await this.authRepository.updateUserByID(userId, templateForUpdateUser);
            }
            await updateUserEmailConfirmationStatus();
            mailer.sendLinkForCompleteRegistration(email, confirmationEmailCode);
            return true;
        } catch (e) {
            return false;
        }
    };
    async signIn({userLoginOrEmail, userPassword, userIp, userDeviceName}: sessionDataType):
        Promise<{ accessToken: string, refreshToken: string } | null> {
        const foundedUserByLoginOrEmail: UserTypeExtended | null = await this.usersQueryRepository.getUserByLoginOrEmail(userLoginOrEmail);
        if (!foundedUserByLoginOrEmail) return null;
        if (foundedUserByLoginOrEmail.accountData.password === null) return null;
        const comparePass = await compare(userPassword, foundedUserByLoginOrEmail.accountData.password!);
        if (!comparePass) return null;
        const deviceId: string = uuidv4();
        const userId: string = foundedUserByLoginOrEmail.id;
        const {accessToken, refreshToken: {refreshToken, expiresDate, issuedAt}} = createNewPairOfTokens({
            userId,
            deviceId
        });
        const newSession: SessionType = {
            issuedAt,
            expiresDate,
            deviceId,
            userIp,
            userDeviceName,
            userId
        }
        await this.authRepository.addNewSession(newSession);
        return {
            accessToken,
            refreshToken
        }
    };
    updateSession(deviceId: string, dataForUpdateSession: DataForUpdateSessionType): Promise<boolean> {
        return this.authRepository.updateSession(deviceId, dataForUpdateSession);
    };
    deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        return this.authRepository.deleteSessionByDeviceId(deviceId);
    };
    async deleteAllSessionsExceptCurrent(currentUserId: string, currentDeviceId: string): Promise<void> {
        type deviceId = string;
        const sessionsDeviceIdExceptCurrentArr: deviceId[] = [];
        const sessionsHandler = (session: SessionType): void => {
            if (session.deviceId !== currentDeviceId) sessionsDeviceIdExceptCurrentArr.push(session.deviceId);
        }
        const sessionsArray = await this.authQueryRepository.getAllSessionsByUserId(currentUserId);
        sessionsArray.forEach(sessionsHandler);
        this.authRepository.deleteManySessions(sessionsDeviceIdExceptCurrentArr);
    };
    async sendPasswordRecoveryCode(email: string): Promise<void> {
        const foundedUserByEmail: UserTypeExtended | null = await this.usersQueryRepository.getUserByEmail(email);
        if (foundedUserByEmail) {
            try {
                const userId = foundedUserByEmail.id;
                const confirmationCode: string = uuidv4();
                const updateUserPasswordRecoveryCode = async (): Promise<void> => {
                    const userUpdateData: UserTypeExtendedOptionalFields = {
                        accountData: {
                            login: foundedUserByEmail.accountData.login,
                            email: foundedUserByEmail.accountData.email,
                            password: null,
                            createdAt: foundedUserByEmail.accountData.createdAt
                        },
                        passwordRecovery: {
                            recoveryCode: confirmationCode
                        }
                    };
                    await this.authRepository.updateUserByID(userId,userUpdateData);
                }
                await updateUserPasswordRecoveryCode();
                mailer.sendLinkForPasswordRecovery(email, confirmationCode);
            } catch (e) {
                console.log(e);
            }
        }
    };
    async changeUserPassword(newPassword: string, recoveryCode: string, user: UserTypeExtended): Promise<void> {
        const updateUserPassword = async (): Promise<void> => {
            const passwordHash = await hash(newPassword, 10);
            const userId = user.id;
            const userUpdateData: UserTypeExtendedOptionalFields = {
                accountData: {
                    login: user.accountData.login,
                    email: user.accountData.email,
                    password: passwordHash,
                    createdAt: user.accountData.createdAt
                },
                passwordRecovery: {
                    recoveryCode: null
                }
            };
            await this.authRepository.updateUserByID(userId, userUpdateData);
        }
        await updateUserPassword();
    };
    async deleteAllSessions(): Promise<void> {
        await this.authRepository.deleteAllSessions();
    }
}