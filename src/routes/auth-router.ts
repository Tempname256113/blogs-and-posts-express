import {body, matchedData, validationResult} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {RequestWithBody, ResponseWithBody} from "../models/req-res-models";
import {Request, Response, Router} from "express";
import {usersQueryRepository} from "../repositories/users/users-query-repository";
import {InfoAboutUserType, RequestUserType, UserType, UserTypeExtended} from "../models/user-models";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {
    createNewUserValidationMiddlewaresArray
} from "../middlewares/middlewares-arrays/create-new-user-validation-middlewares-array";
import {authService} from "../domain/auth-service";
import {errorObjType} from "../models/errorObj-model";
import {checkRequestRefreshTokenCookieMiddleware} from "../middlewares/check-request-refreshToken-cookie-middleware";
import {AccessTokenPayloadType, RefreshTokenPayloadType} from "../models/token-models";
import {createNewPairOfTokens} from "./application/jwt-methods";
import {DataForUpdateSessionType} from "../models/session-models";
import {requestLimiterMiddleware} from "../middlewares/request-limiter-middleware";

export const authRouter = Router();

const refreshTokenPropTitle: string = 'refreshToken';

authRouter.post('/login',
    requestLimiterMiddleware,
    body('loginOrEmail').isString().trim().isLength({min: 1}),
    body('password').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: ResponseWithBody<{ accessToken: string }>) => {
        const userLoginOrEmail = req.body.loginOrEmail;
        const userPassword = req.body.password;
        const userIp = req.ip;
        const userDeviceName = req.headers["user-agent"];
        const pairOfTokens: { accessToken: string, refreshToken: string } | null = await authService.signIn({
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
    async (req: Request, res: ResponseWithBody<{ accessToken: string, refreshToken: string }>) => {
        const userIp = req.ip;
        const userDeviceName = req.headers["user-agent"];
        const {userId, deviceId} = req.context.refreshTokenPayload as RefreshTokenPayloadType;
        const {accessToken, refreshToken: {refreshToken, issuedAt, expiresDate}} = createNewPairOfTokens({
            userId,
            deviceId
        });
        const dataForUpdateSession: DataForUpdateSessionType = {
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
        const {deviceId} = req.context.refreshTokenPayload as RefreshTokenPayloadType;
        await authService.deleteSessionByDeviceId(deviceId);
        res.sendStatus(204);
    });

authRouter.get('/me',
    bearerUserAuthTokenCheckMiddleware,
    async (req: Request, res: ResponseWithBody<InfoAboutUserType>) => {
        const {userId} = req.context.accessTokenPayload as AccessTokenPayloadType;
        const userFromDB: UserTypeExtended | null = await usersQueryRepository.getUserById(userId);
        if (!userFromDB) return res.sendStatus(401);
        const informationAboutCurrentUser: InfoAboutUserType = {
            email: userFromDB.accountData.email,
            login: userFromDB.accountData.login,
            userId: userFromDB.id
        }
        res.status(200).send(informationAboutCurrentUser);
    });

authRouter.post('/registration',
    requestLimiterMiddleware,
    createNewUserValidationMiddlewaresArray,
    async (req: RequestWithBody<RequestUserType>, res: Response) => {
        const userConfig: RequestUserType = {
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
    requestLimiterMiddleware,
    body('code').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{ code: string }>, res: Response) => {
        const confirmRegistrationStatus: boolean = await authService.confirmRegistration(req.body.code);
        if (confirmRegistrationStatus) return res.sendStatus(204);
        const errorObj: errorObjType = {
            errorsMessages: [{message: 'invalid confirmation code', field: 'code'}]
        }
        res.status(400).send(errorObj);
    });

authRouter.post('/registration-email-resending',
    requestLimiterMiddleware,
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

authRouter.post('/password-recovery',
    requestLimiterMiddleware,
    body('email').isEmail(),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{email: string}>, res: Response) => {
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) return res.sendStatus(400);
    await authService.sendPasswordRecoveryCode(req.body.email);
    res.sendStatus(204);
});

authRouter.post('/new-password',
    requestLimiterMiddleware,
    body('newPassword').isString().trim().isLength({min: 6, max: 20}),
    body('recoveryCode').isString().trim().isLength({min: 1}).custom((value, {req}) => {
        // const foundedUserByRecoveryCode: UserTypeExtended | null
        //     = await usersQueryRepository.getUserByPasswordRecoveryCode(value);
        return new Promise((resolve, reject) => {
            usersQueryRepository.getUserByPasswordRecoveryCode(value).then(foundedUserByRecoveryCode => {
                // console.log(foundedUserByRecoveryCode)
                if (foundedUserByRecoveryCode === null) {
                    reject('Recovery code is incorrect or expired');
                } else {
                    req.context = {userExtended: foundedUserByRecoveryCode};
                    resolve('');
                }
            })
        });
    }),

    catchErrorsMiddleware,
    async (req: RequestWithBody<{newPassword: string, recoveryCode: string}>, res: Response) => {
    // const validationErrors = validationResult(req);
    // if (!validationErrors.isEmpty()) return res.sendStatus(400);
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) return;
    // const updatePasswordStatus: boolean = await authService.changeUserPassword(req.body.newPassword, req.body.recoveryCode);
    // updatePasswordStatus ? res.sendStatus(204) : res.sendStatus(400);
    authService.changeUserPassword(req.body.newPassword, req.body.recoveryCode, req.context.userExtended!);
    res.sendStatus(204);
});