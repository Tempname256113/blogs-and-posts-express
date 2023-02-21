import {sessionType} from "../../domain/auth-service";
import {client} from "../../db";

const db = client.db('ht02DB');
const sessionsCollection = db.collection('sessions');

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
    }
}