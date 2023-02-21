import {requestUserType, userTypeExtended} from "../models/user-models";
import {createTransport} from "nodemailer";
import {v4 as uuidv4} from 'uuid';
import {add} from 'date-fns';
import {authRepository} from "../repositories/auth/auth-repository";
import {compare, genSalt, hash} from "bcrypt";
import {usersQueryRepository} from "../repositories/users/users-query-repository";
import {refreshTokenPayloadType} from "../models/token-models";
import {createNewDefaultPairOfTokens, jwtMethods} from "../routes/application/jwt-methods";

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

export type sessionType = {
    issuedAt: number,
    expiresDate: number,
    deviceId: string,
    userIp: string,
    userDeviceName: string,
    userId: string
}

export type dataForUpdateSessionType = {
    issuedAt: number,
    expiresDate: number,
    userIp: string,
    userDeviceName: string
}

/* настраивает почтовый сервис и отправляет письмо с кодом подтверждения на почту клиента.
* обязательно нужно передать почтовый адрес клиента, другие настройки можно передавать при необходимости.
* если не передавать то дефолтные настройки подставятся сами.
* также нужно передать секретный код который будет интегрирован в ссылку письма для подтверждения */
const sendLinkWithSecretCodeToEmail = async ({
                                                 from = `"Temp256113" <${envVariables.mailUser}>`,
                                                 to,
                                                 subject = "Confirm registration please",
                                                 html
                                             }: mailOptions,
                                             confirmationCode: string): Promise<void> => {
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
    await transporter.sendMail(mailOptions);
}

export const authService = {
    async registrationNewUser({login, password, email}: requestUserType): Promise<boolean> {
        const confirmationEmailCode: string = uuidv4();
        try {
            const salt = await genSalt(10);
            const passwordHash = await hash(password, salt);
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
                    expirationDate: add(new Date, {
                        days: 3
                    }),
                    isConfirmed: false
                }
            }
            await authRepository.createNewUser(newUser);
            await sendLinkWithSecretCodeToEmail({to: email}, confirmationEmailCode);
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
        await authRepository.updateUserEmailConfirmationStatus(foundedUserByConfirmationEmailCode.id);
        return true;
    },
    async resendSecretCodeToEmail(email: string): Promise<boolean> {
        const foundedUserByEmail: userTypeExtended | null = await usersQueryRepository.getUserByEmail(email);
        if (!foundedUserByEmail) return false;
        if (foundedUserByEmail.emailConfirmation.isConfirmed) return false;
        try {
            const confirmationEmailCode: string = uuidv4();
            const templateForUpdateUser: userTypeExtended = {
                id: foundedUserByEmail.id,
                accountData: {
                    login: foundedUserByEmail.accountData.login,
                    email: foundedUserByEmail.accountData.email,
                    password: foundedUserByEmail.accountData.password,
                    createdAt: foundedUserByEmail.accountData.createdAt
                },
                emailConfirmation: {
                    confirmationCode: confirmationEmailCode,
                    expirationDate: add(new Date(), {days: 3}),
                    isConfirmed: false
                }
            }
            const updateUserStatus = await authRepository.updateUser(templateForUpdateUser);
            if (updateUserStatus) {
                await sendLinkWithSecretCodeToEmail({to: email}, confirmationEmailCode);
                return true;
            } else {
                return false;
            }
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
    logout(deviceId: string){

    },
    async deleteAllBannedRefreshTokens(): Promise<void> {

    }
}