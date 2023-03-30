import {RequestUserType, UserType, UserTypeExtended} from "../models/user-models";
import {genSalt, hash} from "bcrypt";
import {UsersRepository} from "../repositories/users/users-repository";
import {v4 as uuidv4} from 'uuid';

export class UsersService {
    constructor(protected usersRepository: UsersRepository) {}
    async createUser({login,password,email}: RequestUserType): Promise<UserType>{
        const salt: string = await genSalt(10);
        const passwordHashWithSalt: string = await hash(password, salt);
        const newUserTemplate: UserTypeExtended = {
            id: uuidv4(),
            accountData: {
                login,
                email,
                password: passwordHashWithSalt,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: 'none',
                expirationDate: new Date(),
                isConfirmed: true
            },
            passwordRecovery: {
                recoveryCode: 'none'
            }
        }
        return this.usersRepository.createUser(newUserTemplate);
    };
    async deleteUser(userId: string): Promise<boolean> {
        return this.usersRepository.deleteUser(userId);
    };
    async deleteAllData(): Promise<void>{
        await this.usersRepository.deleteAllData();
    }
}