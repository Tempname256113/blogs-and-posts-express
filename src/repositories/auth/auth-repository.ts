import {userTypeExtended} from "../../models/user-models";
import {client} from "../../db";
import {dataForUpdateSessionType, sessionType} from "../../domain/auth-service";

const db = client.db('ht02DB');
const usersCollection = db.collection('users');
const sessionsCollection = db.collection('sessions');

export const authRepository = {
    async createNewUser(newUser: userTypeExtended): Promise<void> {
        await usersCollection.insertOne(newUser);
    },
    async updateUserEmailConfirmationStatus(userId: string): Promise<void> {
        await usersCollection.updateOne({id: userId},
            {
                $set: {
                    'emailConfirmation.isConfirmed': true
                }
            })
    },
    // принимает параметром объект юзера и полностью его обновляет в соответствии с приходящимим объектом
    async updateUser(
        {
            id,
            accountData: {login, email, password, createdAt},
            emailConfirmation: {confirmationCode, expirationDate, isConfirmed}
        }: userTypeExtended): Promise<boolean> {
        const foundedUser = await usersCollection.findOne({id});
        if (foundedUser) {
            await usersCollection.updateOne({id},
                {
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
                })
            return true;
        }
        return false;
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
        }
        const matchedSession = await sessionsCollection.updateOne(filter, updateSession);
        return matchedSession.matchedCount > 0;
    },
    async createNewSession(newSession: sessionType): Promise<void> {
        await sessionsCollection.insertOne(newSession);
    }
}