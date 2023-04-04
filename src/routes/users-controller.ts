import {UsersQueryRepository} from "../repositories/users/users-query-repository";
import {UsersService} from "../domain/users-service";
import {
    reqQueryPagination,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    ResponseWithBody
} from "../models/req-res-models";
import {Response} from "express";
import {RequestUserType, UsersQueryPaginationType, UserType} from "../models/user-models";
import {
    ResultOfPaginationUsersByQueryType
} from "../repositories/mongo-DB-features/pagination-by-query-params-functions";
import {injectable} from "inversify";

@injectable()
export class UsersController {
    constructor(protected usersQueryRepository: UsersQueryRepository, protected usersService: UsersService) {
    }

    async getAllUsersWithPagination(
        req: RequestWithQuery<reqQueryPagination & { searchLoginTerm?: string, searchEmailTerm?: string }>,
        res: Response
    ) {
        const paginationConfig: UsersQueryPaginationType = {
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10,
            searchLoginTerm: req.query.searchLoginTerm,
            searchEmailTerm: req.query.searchEmailTerm
        }
        const paginationResponse: ResultOfPaginationUsersByQueryType = await this.usersQueryRepository.getAllUsersWithPagination(paginationConfig);
        res.status(200).send(paginationResponse);
    };

    async createNewUser(req: RequestWithBody<RequestUserType>, res: ResponseWithBody<UserType>) {
        const requestUser: RequestUserType = {
            login: req.body.login,
            password: req.body.password,
            email: req.body.email
        }
        const createdUser: UserType = await this.usersService.createUser(requestUser);
        res.status(201).send(createdUser);
    };

    async deleteUser(req: RequestWithURIParams<{ id: string }>, res: Response) {
        const deletedUserStatus: boolean = await this.usersService.deleteUser(req.params.id);
        deletedUserStatus ? res.sendStatus(204) : res.sendStatus(404);
    }
}