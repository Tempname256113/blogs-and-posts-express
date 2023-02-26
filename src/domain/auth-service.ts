import {requestUserType, userTypeExtended} from "../models/user-models";
import {createTransport} from "nodemailer";
import {v4 as uuidv4} from 'uuid';
import {add} from 'date-fns';
import {authRepository} from "../repositories/auth/auth-repository";
import {compare, genSalt, hash} from "bcrypt";
import {usersQueryRepository} from "../repositories/users/users-query-repository";
import {createNewDefaultPairOfTokens} from "../routes/application/jwt-methods";
import {dataForUpdateSessionType, sessionType} from "../models/session-models";
import {authQueryRepository} from "../repositories/auth/auth-query-repository";

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
                                             confirmationCode: string) => {
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

export const authService = {
    async registrationNewUser({login, password, email}: requestUserType): Promise<boolean> {
        const confirmationEmailCode: string = uuidv4();
        try {
            const passwordHash = await hash(password, 10);
            const newUser: userTypeExtended = {
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
                }
            }
            await authRepository.createNewUser(newUser);
            sendLinkWithSecretCodeToEmail({to: email}, confirmationEmailCode);
            return true;
        } catch (e) {
            return false;
        }
    },
    async confirmRegistration(code: string): Promise<boolean> {
        const foundedUserByConfirmationEmailCode: userTypeExtended | null = await usersQueryRepository.getUserByConfirmationEmailCode(code);
        if (!foundedUserByConfirmationEmailCode) return false;
        if (foundedUserByConfirmationEmailCode.emailConfirmation.isConfirmed) return false;
        if (new Date() > foundedUserByConfirmationEmailCode.emailConfirmation.expirationDate) return false;
        const updateUserEmailConfirmationStatus = async (): Promise<void> => {
            const {
                id,
                accountData: {login, email, password, createdAt},
                emailConfirmation: {confirmationCode, expirationDate}
            } = foundedUserByConfirmationEmailCode;
            const templateForUpdateUser: userTypeExtended = {
                id,
                accountData: {
                    login,
                    email,
                    password,
                    createdAt
                },
                emailConfirmation: {
                    confirmationCode,
                    expirationDate,
                    isConfirmed: true
                }
            }
            await authRepository.updateUser(templateForUpdateUser);
        }
        await updateUserEmailConfirmationStatus();
        return true;
    },
    async resendSecretCodeToEmail(email: string): Promise<boolean> {
        const foundedUserByEmail: userTypeExtended | null = await usersQueryRepository.getUserByEmail(email);
        if (!foundedUserByEmail) return false;
        if (foundedUserByEmail.emailConfirmation.isConfirmed) return false;
        try {
            const confirmationEmailCode: string = uuidv4();
            const {id, accountData: {login, email, password, createdAt}} = foundedUserByEmail;
            const templateForUpdateUser: userTypeExtended = {
                id,
                accountData: {
                    login,
                    email,
                    password,
                    createdAt
                },
                emailConfirmation: {
                    confirmationCode: confirmationEmailCode,
                    expirationDate: add(new Date(), {days: 3}),
                    isConfirmed: false
                }
            }
            const updateUserStatus = await authRepository.updateUser(templateForUpdateUser);
            if (!updateUserStatus) return false;
            sendLinkWithSecretCodeToEmail({to: email}, confirmationEmailCode);
            return true;
        } catch (e) {
            return false;
        }
    },
    async createNewSession({userLoginOrEmail, userPassword, userIp, userDeviceName}: sessionDataType):
        Promise<{ accessToken: string, refreshToken: string } | null> {
        const foundedUserByLoginOrEmail: userTypeExtended | null = await usersQueryRepository.getUserByLoginOrEmail(userLoginOrEmail);
        if (!foundedUserByLoginOrEmail) return null;
        const comparePass = await compare(userPassword, foundedUserByLoginOrEmail.accountData.password!);
        if (!comparePass) return null;
        const deviceId: string = uuidv4();
        const userId: string = foundedUserByLoginOrEmail.id;
        const {accessToken, refreshToken: {refreshToken, expiresDate, issuedAt}} = createNewDefaultPairOfTokens({
            userId,
            deviceId
        });
        const newSession: sessionType = {
            issuedAt,
            expiresDate,
            deviceId,
            userIp,
            userDeviceName,
            userId
        }
        await authRepository.createNewSession(newSession);
        return {
            accessToken,
            refreshToken
        }
    },
    updateSession(deviceId: string, dataForUpdateSession: dataForUpdateSessionType): Promise<boolean> {
        return authRepository.updateSession(deviceId, dataForUpdateSession);
    },
    deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        return authRepository.deleteSessionByDeviceId(deviceId);
    },
    async deleteAllSessionsExceptCurrent(currentUserId: string, currentDeviceId: string): Promise<void> {
        type deviceId = string;
        const sessionsDeviceIdExceptCurrentArr: deviceId[] = [];
        const sessionsHandler = (session: sessionType): void => {
            if (session.deviceId !== currentDeviceId) sessionsDeviceIdExceptCurrentArr.push(session.deviceId);
        }
        await authQueryRepository.getAllSessionsByUserId(currentUserId).forEach(sessionsHandler);
        authRepository.deleteManySessions(sessionsDeviceIdExceptCurrentArr);
    },
    async deleteAllSessions(): Promise<void> {
        await authRepository.deleteAllSessions();
    }
}