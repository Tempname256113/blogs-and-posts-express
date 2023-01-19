import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catchErrorsMiddleware";
import {RequestWithBody} from "../models/reqResModels";
import {Request, Response, Router} from "express";
import {usersService} from "../domain/usersService";
import {jwtMethods} from "./application/jwtMethods";
import {userTokenPayloadType} from "../models/tokenModels";
import {usersQueryRepository} from "../repositories/users/usersQueryRepository";
import {infoAboutUserType, requestUserType, userType} from "../models/userModels";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearerUserAuthTokenCheckMiddleware";
import {
    createNewUserValidationMiddlewaresArray
} from "../middlewares/middlewaresArray/createNewUserValidationMiddlewaresArray";
import {authService} from "../domain/authService";

export const authRouter = Router();
const JWT_SECRET: string = process.env.JWT_SECRET!;

authRouter.post('/login',
    body('loginOrEmail').isString().trim().isLength({min: 1}),
    body('password').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: Response) => {
        const recievedUser = await usersService.authUser({
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password
        });
        if (recievedUser.comparePasswordStatus) {
            const tokenPayload: userTokenPayloadType = {
                userId: recievedUser.findedUserByLoginOrEmail!.id
            }
            const token = await jwtMethods.createNewToken(tokenPayload, JWT_SECRET, {expiresIn: '999d'});
            const responseObj = {
                accessToken: token
            }
            return res.status(200).send(responseObj);
        }
        res.sendStatus(401);
});

authRouter.get('/me',
    bearerUserAuthTokenCheckMiddleware,
    async (req: Request, res: Response) => {
        const userId: string = req.context!.JWT_PAYLOAD!.userId!
        const userFromDB: userType | null = await usersQueryRepository.getUserById(userId);
        const informationAboutCurrentUser: infoAboutUserType = {
            email: userFromDB!.email,
            login: userFromDB!.login,
            userId: userFromDB!.id
        }
        res.status(200).send(informationAboutCurrentUser);
});

authRouter.post('/registration',
    createNewUserValidationMiddlewaresArray,
    async (req: Request, res: Response) => {
        const userConfig: requestUserType = {
            login: req.body.login,
            password: req.body.password,
            email: req.body.email
        }
        const result = await authService.registrationNewUser(userConfig);
        res.status(200).send(result);
});