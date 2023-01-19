import {userTypeExtended} from "../../models/userModels";
import {client} from "../../db";

const usersCollection = client.db('ht02DB').collection('users');

export const authRepository = {
    async createNewUser(newUser: userTypeExtended): Promise<void>{
        await usersCollection.insertOne(newUser);
    }
}