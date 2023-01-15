import {client} from "../../db";
import {usersQueryPaginationType, userType} from "../../models/userModels";
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
    async getUserByLoginOrEmail(userLoginOrEmail: string): Promise<userType | null> {
        const userByLoginOrEmail = await usersCollection.findOne({
            $or: [
                {login: userLoginOrEmail},
                {email: userLoginOrEmail}
            ]
        });
        if (userByLoginOrEmail) {
            const foundedUser: userType = {
                id: userByLoginOrEmail.id,
                login: userByLoginOrEmail.login,
                email: userByLoginOrEmail.email,
                password: userByLoginOrEmail.password,
                createdAt: userByLoginOrEmail.createdAt
            }
            return foundedUser;
        }
        return null;
    },
    async getUserById(id: string): Promise<userType | null> {
        const foundedUserById = await usersCollection.findOne({id});
        if (foundedUserById) {
            const infoAboutUser: userType = {
                id: foundedUserById.id,
                login: foundedUserById.login,
                email: foundedUserById.email,
                password: foundedUserById.password,
                createdAt: foundedUserById.createdAt
            }
            return infoAboutUser;
        }
        return null;
    }
}