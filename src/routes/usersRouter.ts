import {Router, Response} from "express";
import {
    reqQueryPagination,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    ResponseWithBody
} from "../models/reqResModels";
import {requestUserType, usersQueryPaginationType, userType} from "../models/userModels";
import {authorizationCheckMiddleware} from "../middlewares/authorizationCheckMiddleware";
import {usersQueryRepository} from "../repositories/users/usersQueryRepository";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catchErrorsMiddleware";
import {usersService} from "../domain/usersService";

export const usersRouter = Router();

usersRouter.get('/',
    authorizationCheckMiddleware,
    async (req: RequestWithQuery<reqQueryPagination & {searchLoginTerm?: string, searchEmailTerm?: string}>, res: Response) => {
    const paginationConfig: usersQueryPaginationType = {
        sortBy: req.query.sortBy ?? 'createdAt',
        sortDirection: req.query.sortDirection ?? 'desc',
        pageNumber: req.query.pageNumber ?? 1,
        pageSize: req.query.pageSize ?? 10,
        searchLoginTerm: req.query.searchLoginTerm,
        searchEmailTerm: req.query.searchEmailTerm
    }
    const paginationResponse = await usersQueryRepository.getAllUsersWithPagination(paginationConfig);
    res.status(200).send(paginationResponse);
})

usersRouter.post('/',
    authorizationCheckMiddleware,
    body('login').isString().trim().matches('^[a-zA-Z0-9_-]*$').isLength({min: 3, max: 10}),
    body('password').isString().trim().isLength({min: 6, max: 20}),
    body('email').isString().trim().matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$').isLength({min: 5}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<requestUserType>, res: ResponseWithBody<userType>) => {
    const requestUser: requestUserType = {
        login: req.body.login,
        password: req.body.password,
        email: req.body.email
    }
    const createdUser = await usersService.createUser(requestUser);
    res.status(201).send(createdUser);
})

usersRouter.delete('/:id',
    authorizationCheckMiddleware,
    async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const deletedUserStatus = await usersService.deleteUser(req.params.id);
    if (deletedUserStatus) return res.sendStatus(204);
    res.sendStatus(404);
})