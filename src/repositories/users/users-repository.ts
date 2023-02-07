import {userType, userTypeExtended} from "../../models/user-models";
import {client} from "../../db";

const usersCollection = client.db('ht02DB').collection('users');

export const usersRepository = {
    async createUser(newUserTemplate: userTypeExtended): Promise<userType> {
        await usersCollection.insertOne(newUserTemplate);
        const {id, accountData: {login, email, createdAt}} = newUserTemplate;
        return {
            id,
            login,
            email,
            createdAt
        }
    },
    async deleteUser(userId: string): Promise<boolean> {
        const deletedUserStatus = await usersCollection.deleteOne({id: userId});
        return deletedUserStatus.deletedCount > 0;
    },
    async deleteAllData(): Promise<void> {
        await usersCollection.deleteMany({});
    },
    async updateUser() {

    }
}