import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {RequestWithBody, ResponseWithBody} from "../models/req-res-models";
import {Request, Response, Router} from "express";
import {usersService} from "../domain/users-service";
import {jwtMethods} from "./application/jwt-methods";
import {accessTokenPayloadType, refreshTokenPayloadType} from "../models/token-models";
import {usersQueryRepository} from "../repositories/users/users-query-repository";
import {infoAboutUserType, requestUserType, userType, userTypeExtended} from "../models/user-models";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {
    createNewUserValidationMiddlewaresArray
} from "../middlewares/middlewares-array/create-new-user-validation-middlewares-array";
import {authService} from "../domain/auth-service";
import {errorObjType} from "../models/errorObj-model";
import {checkRequestRefreshTokenCookieMiddleware} from "../middlewares/check-request-refreshToken-cookie-middleware";

export const authRouter = Router();

const refreshTokenString: string = 'refreshToken';
const getNewPairOfTokens = ({userId}: accessTokenPayloadType) => {
    const accessToken: string = jwtMethods.createToken.accessToken({userId}, {expiresIn: '10s'});
    const refreshToken: string = jwtMethods.createToken.refreshToken({userId}, {expiresIn: '20s'});
    return {
        accessToken,
        refreshToken
    }
}

authRouter.post('/login',
    body('loginOrEmail').isString().trim().isLength({min: 1}),
    body('password').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: ResponseWithBody<{ accessToken: string }>) => {
        const recievedUser = await usersService.authUser({
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password
        });
        if (recievedUser.comparePasswordStatus) {
            /* я могу быть уверен в том что юзер будет в этом условии потому что я написал такую логику в userService.
            он здесь будет если passwordStatus === true */
            const {accessToken, refreshToken} = getNewPairOfTokens({userId: recievedUser.findedUserByLoginOrEmail!.id});
            authService.addRefreshTokenToBlackList(req.cookies[refreshTokenString]);
            return res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
                .status(200).send({accessToken});
        }
        res.sendStatus(401);
    });

authRouter.post('/refresh-token',
    checkRequestRefreshTokenCookieMiddleware,
    (req: Request, res: ResponseWithBody<{ accessToken: string }>) => {
        const {JWT_PAYLOAD, refreshTokenFromCookie} = req.context;
        const {accessToken, refreshToken} = getNewPairOfTokens({userId: JWT_PAYLOAD!.userId});
        authService.addRefreshTokenToBlackList(refreshTokenFromCookie!);
        return res.cookie(refreshTokenString, refreshToken, {httpOnly: true, secure: true})
            .status(200).send({accessToken});
    });

authRouter.post('/logout',
    checkRequestRefreshTokenCookieMiddleware,
    (req: Request, res: Response) => {
        const refreshTokenPayload = req.context.JWT_PAYLOAD;
        authService.addRefreshTokenToBlackList(req.context.refreshTokenFromCookie!);
        res.sendStatus(204);
    });

authRouter.get('/me',
    bearerUserAuthTokenCheckMiddleware,
    async (req: Request, res: ResponseWithBody<{ email: string, login: string, userId: string }>) => {
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
    async (req: RequestWithBody<requestUserType>, res: Response) => {
        const userConfig: requestUserType = {
            login: req.body.login,
            password: req.body.password,
            email: req.body.email
        }
        const registrationStatus = await authService.registrationNewUser(userConfig);
        if (registrationStatus) {
            return res.sendStatus(204);
        }
        /* отправляется в случае ошибки только поле email.
        если другие поля не пройдут массив проверочных middleware отправит ошибку сам */
        const errorObj: errorObjType = {
            errorsMessages: [{message: 'invalid email or we have technical problems', field: 'email'}]
        }
        res.status(400).send(errorObj);
    });

authRouter.post('/registration-confirmation',
    body('code').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{ code: string }>, res: Response) => {
        const confirmRegistrationStatus = await authService.confirmRegistration(req.body.code);
        if (confirmRegistrationStatus) return res.sendStatus(204);
        const errorObj: errorObjType = {
            errorsMessages: [{message: 'invalid confirmation code', field: 'code'}]
        }
        res.status(400).send(errorObj);
    });

authRouter.post('/registration-email-resending',
    body('email').isEmail(),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{ email: string }>, res: Response) => {
        const emailSecretCodeResendingStatus = await authService.resendSecretCodeToEmail(req.body.email);
        if (emailSecretCodeResendingStatus) return res.sendStatus(204);
        const errorObj: errorObjType = {
            errorsMessages: [{message: 'invalid email or we have technical problems', field: 'email'}]
        }
        res.status(400).send(errorObj);
    });