import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catchErrorsMiddleware";
import {RequestWithBody, ResponseWithBody} from "../models/reqResModels";
import {Request, Response, Router} from "express";
import {usersService} from "../domain/usersService";
import {jwtMethods} from "./application/jwtMethods";
import {userTokenPayloadType} from "../models/tokenModels";
import {usersQueryRepository} from "../repositories/users/usersQueryRepository";
import {infoAboutUserType, requestUserType, userType, userTypeExtended} from "../models/userModels";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearerUserAuthTokenCheckMiddleware";
import {
    createNewUserValidationMiddlewaresArray
} from "../middlewares/middlewaresArray/createNewUserValidationMiddlewaresArray";
import {authService} from "../domain/authService";
import {errorObjType} from "../models/errorObjModel";

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
    async (req: Request, res: ResponseWithBody<{email: string, login: string, userId: string}>) => {
        const userId: string = req.context!.JWT_PAYLOAD!.userId!;
        const userFromDB: userTypeExtended | null = await usersQueryRepository.getUserById(userId);
        const informationAboutCurrentUser: infoAboutUserType = {
            email: userFromDB!.accountData.email,
            login: userFromDB!.accountData.login,
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
        const registrationStatus = await authService.registrationNewUser(userConfig);
        if (registrationStatus) {
            return res.sendStatus(204);
        }
        const errorObj: errorObjType = {
            errorsMessages: [{message: 'invalid email or we have technical problems', field: 'email'}]
        }
        res.status(400).send(errorObj);
});

authRouter.post('/registration-confirmation',
    body('code').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{code: string}>, res: Response) => {
    const confirmRegistrationStatus = await authService.confirmRegistration(req.body.code);
    if (confirmRegistrationStatus) return res.sendStatus(204);
        const errorObj: errorObjType = {
            errorsMessages: [{message: 'invalid confirmation code', field: 'code'}]
        }
    res.send(400).send(errorObj);
});

authRouter.post('/registration-email-resending',
    body('email').isEmail(),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{email: string}>, res: Response) => {
    const emailSecretCodeResendingStatus = await authService.resendSecretCodeToEmail(req.body.email);
    if (emailSecretCodeResendingStatus) return res.sendStatus(204);
    const errorObj: errorObjType = {
        errorsMessages: [{message: 'invalid email or we have technical problems', field: 'email'}]
    }
    res.status(400).send(errorObj);
});