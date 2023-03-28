import {UsersQueryPaginationType, UserTypeExtended} from "../../models/user-models";
import {
    paginationUsersByQueryParams,
    QueryPaginationWithSearchConfigType,
    ResultOfPaginationUsersByQueryType
} from "../mongo-DB-features/pagination-by-query-params-functions";
import {UserModel} from "../../mongoose-db-models/auth-db-models";

class UsersQueryRepository {
    async getAllUsersWithPagination(
        {
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            searchLoginTerm = '',
            searchEmailTerm = ''}: UsersQueryPaginationType): Promise<ResultOfPaginationUsersByQueryType> {
        const queryPaginationWithSearchConfig: QueryPaginationWithSearchConfigType = {
            searchConfig: {$or: [
                    {'accountData.login': {$regex: searchLoginTerm, $options: 'i'}},
                    {'accountData.email': {$regex: searchEmailTerm, $options: 'i'}}
                ]},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationUsersByQueryParams(queryPaginationWithSearchConfig);
    };
    async getUserByLoginOrEmail(userLoginOrEmail: string): Promise<UserTypeExtended | null> {
        return UserModel.findOne({
            $or: [
                {'accountData.login': userLoginOrEmail},
                {'accountData.email': userLoginOrEmail}
            ]
        }, {_id: false});
    };
    async getUserById(id: string): Promise<UserTypeExtended | null> {
        return UserModel.findOne({id}, {_id: false});
    };
    async getUserByLogin(userLogin: string): Promise<UserTypeExtended | null> {
        return UserModel.findOne({'accountData.login': userLogin}, {_id: false});
    };
    async getUserByEmail(userEmail: string): Promise<UserTypeExtended | null> {
        return UserModel.findOne({'accountData.email': userEmail}, {_id: false});
    };
    async getUserByConfirmationEmailCode(code: string): Promise<UserTypeExtended | null> {
        return UserModel.findOne({'emailConfirmation.confirmationCode': code}, {_id: false});
    };
    async getUserByPasswordRecoveryCode(recoveryCode: string): Promise<UserTypeExtended | null> {
        return UserModel.findOne({'passwordRecovery.recoveryCode': recoveryCode}, {_id: false});
    }
}

export const usersQueryRepository = new UsersQueryRepository();