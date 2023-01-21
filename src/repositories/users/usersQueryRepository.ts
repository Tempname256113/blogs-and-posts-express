import {client} from "../../db";
import {usersQueryPaginationType, userType, userTypeExtended} from "../../models/userModels";
import {
    paginationUsersByQueryParams,
    queryPaginationTypeWithSearchConfig,
} from "../mongoDBFeatures/paginationByQueryParamsFunctions";

const usersCollection = client.db('ht02DB').collection('users');

export const usersQueryRepository = {
    async getAllUsersWithPagination({sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm = '', searchEmailTerm = ''}: usersQueryPaginationType){
        const queryPaginationWithSearchConfig: queryPaginationTypeWithSearchConfig = {
            searchConfig: {$or: [
                    {login: {$regex: searchLoginTerm, $options: 'i'}},
                    {email: {$regex: searchEmailTerm, $options: 'i'}}
                ]},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationUsersByQueryParams(queryPaginationWithSearchConfig);
    },
    async getUserByLoginOrEmail(userLoginOrEmail: string): Promise<userTypeExtended | null> {
        const userByLoginOrEmail = await usersCollection.findOne({
            $or: [
                {'accountData.login': userLoginOrEmail},
                {'accountData.email': userLoginOrEmail}
            ]
        });
        if (userByLoginOrEmail) {
            const foundedUser: userTypeExtended = {
                id: userByLoginOrEmail.id,
                accountData: {
                    login: userByLoginOrEmail.accountData.login,
                    email: userByLoginOrEmail.accountData.email,
                    password: userByLoginOrEmail.accountData.password,
                    createdAt: userByLoginOrEmail.accountData.createdAt
                },
                emailConfirmation: {
                    confirmationCode: userByLoginOrEmail.emailConfirmation.confirmationCode,
                    expirationDate: userByLoginOrEmail.emailConfirmation.expirationDate,
                    isConfirmed: userByLoginOrEmail.emailConfirmation.isConfirmed
                }
            }
            return foundedUser;
        }
        return null;
    },
    async getUserById(id: string): Promise<userTypeExtended | null> {
        const foundedUserById = await usersCollection.findOne({id});
        if (foundedUserById) {
            const infoAboutUser: userTypeExtended = {
                id: foundedUserById.id,
                accountData: {
                    login: foundedUserById.accountData.login,
                    email: foundedUserById.accountData.email,
                    password: foundedUserById.accountData.password,
                    createdAt: foundedUserById.accountData.createdAt
                },
                emailConfirmation: {
                    confirmationCode: foundedUserById.emailConfirmation.confirmationCode,
                    expirationDate: foundedUserById.emailConfirmation.expirationDate,
                    isConfirmed: foundedUserById.emailConfirmation.isConfirmed
                }
            }
            return infoAboutUser;
        }
        return null;
    },
    async getUserByLogin(userLogin: string): Promise<userTypeExtended | null> {
        const foundedUser = await usersCollection.findOne({'accountData.login': userLogin});
        if (foundedUser) {
            const user: userTypeExtended = {
                id: foundedUser.id,
                accountData: {
                    login: foundedUser.accountData.login,
                    email: foundedUser.accountData.email,
                    password: foundedUser.accountData.password,
                    createdAt: foundedUser.accountData.createdAt
                },
                emailConfirmation: {
                    confirmationCode: foundedUser.emailConfirmation.confirmationCode,
                    expirationDate: foundedUser.emailConfirmation.expirationDate,
                    isConfirmed: foundedUser.emailConfirmation.isConfirmed
                }
            }
            return user;
        }
        return null;
    },
    async getUserByEmail(userEmail: string): Promise<userTypeExtended | null> {
        const foundedUser = await usersCollection.findOne({'accountData.email': userEmail});
        if (foundedUser) {
            const user: userTypeExtended = {
                id: foundedUser.id,
                accountData: {
                    login: foundedUser.accountData.login,
                    email: foundedUser.accountData.email,
                    password: foundedUser.accountData.password,
                    createdAt: foundedUser.accountData.createdAt
                },
                emailConfirmation: {
                    confirmationCode: foundedUser.emailConfirmation.confirmationCode,
                    expirationDate: foundedUser.emailConfirmation.expirationDate,
                    isConfirmed: foundedUser.emailConfirmation.isConfirmed
                }
            }
            return user;
        }
        return null;
    },
    async getUserByConfirmationEmailCode(code: string): Promise<userTypeExtended | null> {
        const foundedUser = await usersCollection.findOne({'emailConfirmation.confirmationCode': code});
        if (foundedUser) {
            const user: userTypeExtended = {
                id: foundedUser.id,
                accountData: {
                    login: foundedUser.accountData.login,
                    email: foundedUser.accountData.email,
                    createdAt: foundedUser.accountData.createdAt
                },
                emailConfirmation: {
                    confirmationCode: foundedUser.emailConfirmation.confirmationCode,
                    expirationDate: foundedUser.emailConfirmation.expirationDate,
                    isConfirmed: foundedUser.emailConfirmation.isConfirmed
                }
            }
            return user;
        }
        return null;
    }
}