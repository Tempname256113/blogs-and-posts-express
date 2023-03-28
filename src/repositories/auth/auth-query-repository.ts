import {SessionType} from "../../models/session-models";
import {SessionModel} from "../../mongoose-db-models/auth-db-models";

class AuthQueryRepository {
    async getSessionByDeviceId(deviceId: string): Promise<SessionType | null> {
        return SessionModel.findOne({deviceId}, {_id: false});
    };
    getAllSessionsByUserId(userId: string): Promise<SessionType[]> {
        return SessionModel.find({userId}, {_id: false});
    }
}

export const authQueryRepository = new AuthQueryRepository();