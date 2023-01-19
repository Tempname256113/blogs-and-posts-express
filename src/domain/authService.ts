import {requestUserType, userTypeExtended} from "../models/userModels";
import {createTransport} from "nodemailer";
import {v4 as uuidv4} from 'uuid';
import {add} from 'date-fns';
import {authRepository} from "../repositories/auth/authRepository";

const envVariables = {
    mailUser: process.env.MAIL_USER,
    mailPassword: process.env.MAIL_PASSWORD
}

export const authService = {
    async registrationNewUser({login, password, email}: requestUserType){
        const confirmationEmailCode: string = uuidv4();
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
        const mailOptions = {
            from: '"Temp256113" <smolnikov.456@mail.ru>',
            to: email,
            subject: "Confirm registration please",
            html: "<a>https://some-front.com/confirm-registration?code=${confirmationEmailCode}</a>"
        }
        try {
            const newUser: userTypeExtended = {
                id: uuidv4(),
                accountData: {
                    login,
                    email,
                    password,
                    createdAt: new Date().toISOString()
                },
                emailConfirmation: {
                    confirmationCode: confirmationEmailCode,
                    expirationDate: add(new Date, {
                        minutes: 2
                    }),
                    isConfirmed: false
                }
            }
            await authRepository.createNewUser(newUser);
            await transporter.sendMail(mailOptions);
            return true;
        } catch (e) {
            return false;
        }
    }
}