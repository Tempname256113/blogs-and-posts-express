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
import {authService} from "../domain/auth-service";
import {errorObjType} from "../models/errorObj-model";
import {checkRequestRefreshTokenCookieMiddleware} from "../middlewares/check-request-refreshToken-cookie-middleware";
import {accessTokenPayloadType, refreshTokenPayloadType} from "../models/token-models";
import {createNewDefaultPairOfTokens} from "./application/jwt-methods";
import {dataForUpdateSessionType} from "../models/session-models";
import {counterOfRequestsByASingleIpMiddleware} from "../middlewares/counter-of-requests-by-a-single-ip-middleware";

export const authRouter = Router();

const refreshTokenPropTitle: string = 'refreshToken';

authRouter.post('/login',
    counterOfRequestsByASingleIpMiddleware,
    body('loginOrEmail').isString().trim().isLength({min: 1}),
    body('password').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: ResponseWithBody<{ accessToken: string, refreshToken: string }>) => {
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
            .send({accessToken, refreshToken});
    });

authRouter.post('/refresh-token',
    checkRequestRefreshTokenCookieMiddleware,
    async (req: Request, res: ResponseWithBody<{ accessToken: string, refreshToken: string }>) => {
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
            .status(200).send({accessToken, refreshToken});
    });

authRouter.post('/logout',
    checkRequestRefreshTokenCookieMiddleware,
    async (req: Request, res: Response) => {
        const {deviceId} = req.context.refreshTokenPayload as refreshTokenPayloadType;
        await authService.deleteSessionByDeviceId(deviceId);
        res.sendStatus(204);
    });

authRouter.get('/me',
    bearerUserAuthTokenCheckMiddleware,
    async (req: Request, res: ResponseWithBody<infoAboutUserType>) => {
        const {userId} = req.context.accessTokenPayload as accessTokenPayloadType;
        const userFromDB: userTypeExtended | null = await usersQueryRepository.getUserById(userId);
        if (!userFromDB) return res.sendStatus(401);
        const informationAboutCurrentUser: infoAboutUserType = {
            email: userFromDB.accountData.email,
            login: userFromDB.accountData.login,
            userId: userFromDB.id
        }
        res.status(200).send(informationAboutCurrentUser);
    });

authRouter.post('/registration',
    counterOfRequestsByASingleIpMiddleware,
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
    counterOfRequestsByASingleIpMiddleware,
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
    counterOfRequestsByASingleIpMiddleware,
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