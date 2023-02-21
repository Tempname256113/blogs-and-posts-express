import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {RequestWithBody, ResponseWithBody} from "../models/req-res-models";
import {Request, Response, Router} from "express";
import {usersQueryRepository} from "../repositories/users/users-query-repository";
import {infoAboutUserType, requestUserType, userType, userTypeExtended} from "../models/user-models";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {
    createNewUserValidationMiddlewaresArray
} from "../middlewares/middlewares-array/create-new-user-validation-middlewares-array";
import {authService, dataForUpdateSessionType} from "../domain/auth-service";
import {errorObjType} from "../models/errorObj-model";
import {checkRequestRefreshTokenCookieMiddleware} from "../middlewares/check-request-refreshToken-cookie-middleware";
import {refreshTokenPayloadType} from "../models/token-models";
import {createNewDefaultPairOfTokens} from "./application/jwt-methods";

export const authRouter = Router();

const refreshTokenPropTitle: string = 'refreshToken';

authRouter.post('/login',
    body('loginOrEmail').isString().trim().isLength({min: 1}),
    body('password').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: ResponseWithBody<{ accessToken: string }>) => {
        const userLoginOrEmail = req.body.loginOrEmail;
        const userPassword = req.body.password;
        const userIp = req.ip;
        const userDeviceName = req.headers["user-agent"];
        const pairOfTokens: { accessToken: string, refreshToken: string } | null = await authService.createNewSession({
            userLoginOrEmail,
            userPassword,
            userIp,
            userDeviceName: userDeviceName ?? 'unknown device name'
        });
        if (!pairOfTokens) return res.sendStatus(401);
        const {accessToken, refreshToken} = pairOfTokens;
        res
            .cookie(refreshTokenPropTitle, refreshToken, {httpOnly: true, secure: true})
            .status(200)
            .send({accessToken});
    });

authRouter.post('/refresh-token',
    checkRequestRefreshTokenCookieMiddleware,
    async (req: Request, res: ResponseWithBody<{ accessToken: string }>) => {
        const userIp = req.ip;
        const userDeviceName = req.headers["user-agent"];
        const {userId, deviceId} = req.context.refreshTokenPayload as refreshTokenPayloadType;
        const {accessToken, refreshToken: {refreshToken, issuedAt, expiresDate}} = createNewDefaultPairOfTokens({
            userId,
            deviceId
        });
        const dataForUpdateSession: dataForUpdateSessionType = {
            issuedAt,
            expiresDate,
            userIp,
            userDeviceName: userDeviceName ?? 'unknown device name'
        };
        await authService.updateSession(deviceId, dataForUpdateSession);
        res.cookie(refreshTokenPropTitle, refreshToken, {httpOnly: true, secure: true})
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