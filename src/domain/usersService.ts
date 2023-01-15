import {requestUserType, userType} from "../models/userModels";
import {compare, genSalt, hash} from "bcrypt";
import {usersRepository} from "../repositories/users/usersRepository";
import {usersQueryRepository} from "../repositories/users/usersQueryRepository";

export const usersService = {
    async createUser({login,password,email}: requestUserType): Promise<userType>{
        const salt: string = await genSalt(10);
        const passwordToHashWithSalt: string = await hash(password, salt);
        const newUserTemplate: userType = {
            id: 'id' + (new Date()).getTime(),
            login,
            email,
            password: passwordToHashWithSalt,
            createdAt: new Date().toISOString()
        }
        return usersRepository.createUser(newUserTemplate);
    },
    async deleteUser(userId: string): Promise<boolean> {
        return usersRepository.deleteUser(userId);
    },
    async authUser(authData: {loginOrEmail: string, password: string}) {
        const findedUserByLoginOrEmail: userType | null = await usersQueryRepository.getUserByLoginOrEmail(authData.loginOrEmail);
        if (findedUserByLoginOrEmail) {
            const comparePasswordStatus = await compare(authData.password, findedUserByLoginOrEmail.password!);
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