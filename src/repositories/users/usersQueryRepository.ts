import {client} from "../../db";
import {usersQueryPaginationType} from "../../models/userModels";
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
    async getUserHashForAuthentification(authData: {loginOrEmail: string, password: string}): Promise<string | void>{
        const userByLogin = await usersCollection.findOne({
            $or: [
                {login: authData.loginOrEmail},
                {email: authData.loginOrEmail}
            ]
        });
        if (userByLogin) return userByLogin.password;
    }
}