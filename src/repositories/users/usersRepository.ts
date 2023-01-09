import {userType} from "../../models/userModels";
import {client} from "../../db";

const usersCollection = client.db('ht02DB').collection('users');

export const usersRepository = {
    async createUser(newUserTemplate: userType): Promise<userType>{
        await usersCollection.insertOne(newUserTemplate);
        const {id, login, email, createdAt} = newUserTemplate;
        return {
            id,
            login,
            email,
            createdAt
        }
    },
    async deleteUser(userId: string): Promise<boolean>{
        const deletedUserStatus = await usersCollection.deleteOne({id: userId});
        return deletedUserStatus.deletedCount > 0;
    },
    async deleteAllData(): Promise<void>{
        await usersCollection.deleteMany({});
    }
}