import {requestUserType, userType, userTypeExtended} from "../models/user-models";
import {genSalt, hash} from "bcrypt";
import {usersRepository} from "../repositories/users/users-repository";
import {v4 as uuidv4} from 'uuid';

export const usersService = {
    async createUser({login,password,email}: requestUserType): Promise<userType>{
        const salt: string = await genSalt(10);
        const passwordToHashWithSalt: string = await hash(password, salt);
        const newUserTemplate: userTypeExtended = {
            id: uuidv4(),
            accountData: {
                login,
                email,
                password: passwordToHashWithSalt,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: 'none',
                expirationDate: new Date(),
                isConfirmed: true
            }
        }
        return usersRepository.createUser(newUserTemplate);
    },
    async deleteUser(userId: string): Promise<boolean> {
        return usersRepository.deleteUser(userId);
    },
    async deleteAllData(): Promise<void>{
        await usersRepository.deleteAllData();
    }
}