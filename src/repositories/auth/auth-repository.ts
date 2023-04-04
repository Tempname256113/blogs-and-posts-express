import {UserTypeExtended, UserTypeExtendedOptionalFields} from "../../models/user-models";
import {DataForUpdateSessionType, SessionType} from "../../models/session-models";
import {SessionModel, UserModel} from "../../mongoose-db-models/auth-db-models";
import {injectable} from "inversify";

@injectable()
export class AuthRepository {
    async createNewUser(newUser: UserTypeExtended): Promise<void> {
        await new UserModel(newUser).save();
    };
    // принимает параметром объект юзера и полностью его обновляет в соответствии с приходящимим объектом
    async updateUserByID(userId: string, updateUserData: UserTypeExtendedOptionalFields): Promise<boolean> {
        const updatedUser = await UserModel.updateOne({id: userId}, updateUserData);
        return updatedUser.matchedCount > 0;
    };
    async updateSession(deviceId: string, {
        issuedAt,
        expiresDate,
        userIp,
        userDeviceName
    }: DataForUpdateSessionType): Promise<boolean> {
        const filter = {deviceId};
        const updateSession: DataForUpdateSessionType = {
            issuedAt,
            expiresDate,
            userIp,
            userDeviceName
        };
        const matchedSession = await SessionModel.updateOne(filter, updateSession);
        return matchedSession.matchedCount > 0;
    };
    async addNewSession(newSession: SessionType): Promise<void> {
        await new SessionModel(newSession).save();
    };
    async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        const deletedSession = await SessionModel.deleteOne({deviceId});
        return deletedSession.deletedCount > 0;
    };
    async deleteManySessions(deviceIdArray: string[]): Promise<void> {
        const filter = {deviceId: {$in: deviceIdArray}};
        await SessionModel.deleteMany(filter);
    };
    async deleteAllSessions(): Promise<void> {
        await SessionModel.deleteMany();
    }
}