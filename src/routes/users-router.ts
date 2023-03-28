import {Router, Response} from "express";
import {
    reqQueryPagination,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    ResponseWithBody
} from "../models/req-res-models";
import {RequestUserType, UsersQueryPaginationType, UserType} from "../models/user-models";
import {basicAuthorizationCheckMiddleware} from "../middlewares/basic-authorization-check-middleware";
import {UsersQueryRepository, usersQueryRepository} from "../repositories/users/users-query-repository";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {UsersService} from "../domain/users-service";
import {
    ResultOfPaginationUsersByQueryType
} from "../repositories/mongo-DB-features/pagination-by-query-params-functions";

class UsersController {
    private usersQueryRepository: UsersQueryRepository;
    private usersService: UsersService;
    constructor() {
        this.usersQueryRepository = new UsersQueryRepository();
        this.usersService = new UsersService();
    }
    async getAllUsersWithPagination(
        req: RequestWithQuery<reqQueryPagination & {searchLoginTerm?: string, searchEmailTerm?: string}>,
        res: Response
    ){
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
    async createNewUser(req: RequestWithBody<RequestUserType>, res: ResponseWithBody<UserType>){
        const requestUser: RequestUserType = {
            login: req.body.login,
            password: req.body.password,
            email: req.body.email
        }
        const createdUser: UserType = await this.usersService.createUser(requestUser);
        res.status(201).send(createdUser);
    };
    async deleteUser(req: RequestWithURIParams<{id: string}>, res: Response){
        const deletedUserStatus: boolean = await this.usersService.deleteUser(req.params.id);
        deletedUserStatus ? res.sendStatus(204) : res.sendStatus(404);
    }
}

const usersControllerInstance = new UsersController();
export const usersRouter = Router();

usersRouter.get('/',
    basicAuthorizationCheckMiddleware,
    usersControllerInstance.getAllUsersWithPagination.bind(usersControllerInstance)
);

usersRouter.post('/',
    basicAuthorizationCheckMiddleware,
    body('login').isString().trim().matches('^[a-zA-Z0-9_-]*$').isLength({min: 3, max: 10}),
    body('password').isString().trim().isLength({min: 6, max: 20}),
    body('email').isString().trim().matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$').isLength({min: 5}),
    catchErrorsMiddleware,
    usersControllerInstance.createNewUser.bind(usersControllerInstance)
);

usersRouter.delete('/:id',
    basicAuthorizationCheckMiddleware,
    usersControllerInstance.deleteUser.bind(usersControllerInstance)
);