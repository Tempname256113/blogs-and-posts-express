import {userTypeExtended} from "../../models/user-models";
import {client} from "../../db";
import {dataForUpdateSessionType, sessionType} from "../../models/session-models";

const db = client.db('ht02DB');
const usersCollection = db.collection<userTypeExtended>('users');
const sessionsCollection = db.collection<sessionType>('sessions');

export const authRepository = {
    async createNewUser(newUser: userTypeExtended): Promise<void> {
        await usersCollection.insertOne(newUser);
    },
    // принимает параметром объект юзера и полностью его обновляет в соответствии с приходящимим объектом
    async updateUser(
        {
            id,
            accountData: {login, email, password, createdAt},
            emailConfirmation: {confirmationCode, expirationDate, isConfirmed}
        }: userTypeExtended): Promise<boolean> {
        const filter = {id};
        const updateUserData: { $set: userTypeExtended } = {
            $set: {
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
                    isConfirmed
                }
            }
        };
        const updatedUser = await usersCollection.updateOne(filter,updateUserData);
        return updatedUser.matchedCount > 0;
    },
    async updateSession(deviceId: string, {
        issuedAt,
        expiresDate,
        userIp,
        userDeviceName
    }: dataForUpdateSessionType): Promise<boolean> {
        const filter = {deviceId};
        const updateSession: { $set: dataForUpdateSessionType } = {
            $set: {
                issuedAt,
                expiresDate,
                userIp,
                userDeviceName
            }
        };
        const matchedSession = await sessionsCollection.updateOne(filter, updateSession);
        return matchedSession.matchedCount > 0;
    },
    async createNewSession(newSession: sessionType): Promise<void> {
        await sessionsCollection.insertOne(newSession);
    },
    async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        const deletedSession = await sessionsCollection.deleteOne({deviceId});
        return deletedSession.deletedCount > 0;
    },
    async deleteManySessions(deviceIdArray: string[]): Promise<void> {
        const filter = {deviceId: {$in: deviceIdArray}};
        await sessionsCollection.deleteMany(filter);
    },
    async deleteAllSessions(): Promise<void> {
        await sessionsCollection.deleteMany({});
    }
}