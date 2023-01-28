import {requestUserType, userType, userTypeExtended} from "../models/userModels";
import {compare, genSalt, hash} from "bcrypt";
import {usersRepository} from "../repositories/users/usersRepository";
import {usersQueryRepository} from "../repositories/users/usersQueryRepository";
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
    async authUser(authData: {loginOrEmail: string, password: string}): Promise<{findedUserByLoginOrEmail?: userTypeExtended, comparePasswordStatus: boolean}> {
        const findedUserByLoginOrEmail: userTypeExtended | null = await usersQueryRepository.getUserByLoginOrEmail(authData.loginOrEmail);
        if (findedUserByLoginOrEmail) {
            const comparePasswordStatus = await compare(authData.password, findedUserByLoginOrEmail.accountData.password!);
            return {
                findedUserByLoginOrEmail,
                comparePasswordStatus
            }
        }
        return {
            comparePasswordStatus: false
        };
    },
    async deleteAllData(): Promise<void>{
        await usersRepository.deleteAllData();
    }
}