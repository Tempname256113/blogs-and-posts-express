import {model, Schema} from "mongoose";
import {UserTypeExtended} from "../models/user-models";
import {SessionType} from "../models/session-models";

// по дефолту mongoose добавляет _id во вложенные сущности (вложенные объекты, массивы
// чтобы он этого не делал нужно в mongoose Schema options добавить поле _id: false
// strict: true регулирует схему чтобы новых полей там не было и были все заявленные

const userSchema = new Schema<UserTypeExtended>(
    {
        id: String,
        accountData: {
            login: String,
            email: String,
            password: String,
            createdAt: String,
        },
        emailConfirmation: {
            confirmationCode: String,
            expirationDate: Date,
            isConfirmed: Boolean
        },
        passwordRecovery: {
            recoveryCode: String
        }
    }, {strict: true, versionKey: false}
);

const sessionSchema = new Schema<SessionType>(
    {
        issuedAt: Number,
        expiresDate: Number,
        deviceId: String,
        userIp: String,
        userDeviceName: String,
        userId: String
    }, {strict: true, versionKey: false}
);

const SessionModel = model<SessionType>('Sessions', sessionSchema);
const UserModel = model<UserTypeExtended>('Users', userSchema);

export {UserModel, SessionModel};