import {UserType, UserTypeExtended} from "../../models/user-models";
import {UserModel} from "../../mongoose-db-models/auth-db-models";
import {injectable} from "inversify";

@injectable()
export class UsersRepository {
    async createUser(newUserTemplate: UserTypeExtended): Promise<UserType> {
        await new UserModel(newUserTemplate).save();
        const {id, accountData: {login, email, createdAt}} = newUserTemplate;
        return {
            id,
            login,
            email,
            createdAt
        }
    };
    async deleteUser(userId: string): Promise<boolean> {
        const deletedUserStatus = await UserModel.deleteOne({id: userId});
        return deletedUserStatus.deletedCount > 0;
    };
    async deleteAllData(): Promise<void> {
        await UserModel.deleteMany();
    }
}