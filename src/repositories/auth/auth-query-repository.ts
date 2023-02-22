
import {client} from "../../db";
import {sessionType} from "../../models/session-models";

const db = client.db('ht02DB');
const sessionsCollection = db.collection<sessionType>('sessions');

export const authQueryRepository = {
    async getSessionByDeviceId(deviceId: string): Promise<sessionType | null> {
        const foundedSessionByDeviceId = await sessionsCollection.findOne({deviceId});
        if (foundedSessionByDeviceId) {
            const session: sessionType = {
                issuedAt: foundedSessionByDeviceId.issuedAt,
                expiresDate: foundedSessionByDeviceId.expiresDate,
                deviceId: foundedSessionByDeviceId.deviceId,
                userIp: foundedSessionByDeviceId.userIp,
                userDeviceName: foundedSessionByDeviceId.userDeviceName,
                userId: foundedSessionByDeviceId.userId
            }
            return session;
        } else {
            return null;
        }
    },
     getAllSessionsByUserId(userId: string) {
        return sessionsCollection.find({userId});
    }
}