import {Router} from "express";
import {basicAuthorizationCheckMiddleware} from "../middlewares/basic-authorization-check-middleware";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {iocContainer} from "../composition-root";
import {UsersController} from "./users-controller";

const usersController = iocContainer.getInstance<UsersController>(UsersController);

export const usersRouter = Router();

usersRouter.get('/',
    basicAuthorizationCheckMiddleware,
    usersController.getAllUsersWithPagination.bind(usersController)
);

usersRouter.post('/',
    basicAuthorizationCheckMiddleware,
    body('login').isString().trim().matches('^[a-zA-Z0-9_-]*$').isLength({min: 3, max: 10}),
    body('password').isString().trim().isLength({min: 6, max: 20}),
    body('email').isString().trim().matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$').isLength({min: 5}),
    catchErrorsMiddleware,
    usersController.createNewUser.bind(usersController)
);

usersRouter.delete('/:id',
    basicAuthorizationCheckMiddleware,
    usersController.deleteUser.bind(usersController)
);