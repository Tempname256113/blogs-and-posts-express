import {userTypeExtended} from "../../models/userModels";
import {client} from "../../db";

const usersCollection = client.db('ht02DB').collection('users');

export const authRepository = {
    async createNewUser(newUser: userTypeExtended): Promise<void>{
        await usersCollection.insertOne(newUser);
    },
    async updateUserEmailConfirmationStatus(userId: string): Promise<void> {
        await usersCollection.updateOne({id: userId},
            {$set: {
                'emailConfirmation.isConfirmed': true
            }
        })
    },
    // принимает параметром объект юзера и полностью его обновляет в соответствии с приходящимим объектом
    async updateUser(
        {id,
            accountData: {login, email, password, createdAt},
            emailConfirmation: {confirmationCode, expirationDate, isConfirmed}
        }: userTypeExtended): Promise<boolean> {
        const foundedUser = await usersCollection.findOne({id});
        if (foundedUser) {
            await usersCollection.updateOne({id},
                {$set: {
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
    }
}