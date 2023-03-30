import {AuthService} from "../domain/auth-service";
import {UsersQueryRepository} from "../repositories/users/users-query-repository";
import {RequestWithBody, ResponseWithBody} from "../models/req-res-models";
import {ErrorObjType} from "../models/errorObj-model";
import {Request, Response} from "express";
import {AccessTokenPayloadType, RefreshTokenPayloadType} from "../models/token-models";
import {createNewPairOfTokens} from "./application/jwt-methods";
import {DataForUpdateSessionType} from "../models/session-models";
import {InfoAboutUserType, RequestUserType, UserTypeExtended} from "../models/user-models";
import {validationResult} from "express-validator";

const refreshTokenPropTitle: string = 'refreshToken';

export class AuthController {
    constructor(protected authService: AuthService, protected usersQueryRepository: UsersQueryRepository) {
    }

    async login(
        req: RequestWithBody<{ loginOrEmail: string, password: string }>,
        res: ResponseWithBody<{ accessToken: string } | ErrorObjType>
    ) {
        const userLoginOrEmail: string = req.body.loginOrEmail;
        const userPassword: string = req.body.password;
        const userIp: string = req.ip;
        const userDeviceName: string | undefined = req.headers["user-agent"];
        const pairOfTokens: { accessToken: string, refreshToken: string } | null = await this.authService.signIn({
            userLoginOrEmail,
            userPassword,
            userIp,
            userDeviceName: userDeviceName ?? 'unknown device name'
        });
        if (!pairOfTokens) return res.sendStatus(401);
        res
            .cookie(refreshTokenPropTitle, pairOfTokens.refreshToken, {httpOnly: true, secure: true})
            .status(200)
            .send({accessToken: pairOfTokens.accessToken});
    };

    async getNewPairOfTokens(req: Request, res: ResponseWithBody<{ accessToken: string }>) {
        const userIp: string = req.ip;
        const userDeviceName: string | undefined = req.headers["user-agent"];
        const reqRefreshTokenPayload: RefreshTokenPayloadType = req.context.refreshTokenPayload!;
        const currentDeviceId: string = reqRefreshTokenPayload.deviceId;
        const newPairOfTokens = createNewPairOfTokens({
            userId: reqRefreshTokenPayload.userId,
            deviceId: currentDeviceId
        });
        const dataForUpdateSession: DataForUpdateSessionType = {
            issuedAt: newPairOfTokens.refreshToken.issuedAt,
            expiresDate: newPairOfTokens.refreshToken.expiresDate,
            userIp,
            userDeviceName: userDeviceName ?? 'unknown device name'
        };
        const newRefreshToken: string = newPairOfTokens.refreshToken.refreshToken;
        const newAccessToken: string = newPairOfTokens.accessToken;
        await this.authService.updateSession(currentDeviceId, dataForUpdateSession);
        res
            .cookie(refreshTokenPropTitle, newRefreshToken, {httpOnly: true, secure: true})
            .status(200)
            .send({accessToken: newAccessToken});
    };

    async logout(req: Request, res: Response) {
        const {deviceId}: RefreshTokenPayloadType = req.context.refreshTokenPayload!;
        await this.authService.deleteSessionByDeviceId(deviceId);
        res.sendStatus(204);
    };

    async getInfoAboutMe(req: Request, res: ResponseWithBody<InfoAboutUserType>) {
        const {userId}: AccessTokenPayloadType = req.context.accessTokenPayload!;
        const userFromDB: UserTypeExtended | null = await this.usersQueryRepository.getUserById(userId);
        if (!userFromDB) return res.sendStatus(401);
        const informationAboutCurrentUser: InfoAboutUserType = {
            email: userFromDB.accountData.email,
            login: userFromDB.accountData.login,
            userId: userFromDB.id
        }
        res.status(200).send(informationAboutCurrentUser);
    };

    async registrationNewUser(req: RequestWithBody<RequestUserType>, res: Response) {
        const userConfig: RequestUserType = {
            login: req.body.login,
            password: req.body.password,
            email: req.body.email
        }
        const registrationStatus: boolean = await this.authService.registrationNewUser(userConfig);
        if (registrationStatus) {
            return res.sendStatus(204);
        }
        /* отправляется в случае ошибки только поле email.
        если другие поля не пройдут массив проверочных middleware отправит ошибку сам */
        const errorObj: ErrorObjType = {
            errorsMessages: [{message: 'invalid email or we have technical problems', field: 'email'}]
        }
        res.status(400).send(errorObj);
    };

    async registrationConfirm(req: RequestWithBody<{ code: string }>, res: Response) {
        const confirmRegistrationStatus: boolean = await this.authService.confirmRegistration(req.body.code);
        if (confirmRegistrationStatus) return res.sendStatus(204);
        const errorObj: ErrorObjType = {
            errorsMessages: [{message: 'invalid confirmation code', field: 'code'}]
        }
        res.status(400).send(errorObj);
    };

    async registrationEmailCodeResending(req: RequestWithBody<{ email: string }>, res: Response) {
        const emailSecretCodeResendingStatus: boolean = await this.authService.resendSecretCodeToEmail(req.body.email);
        if (emailSecretCodeResendingStatus) return res.sendStatus(204);
        const errorObj: ErrorObjType = {
            errorsMessages: [{message: 'invalid email or we have technical problems', field: 'email'}]
        }
        res.status(400).send(errorObj);
    };

    async sendPasswordRecoveryCode(req: RequestWithBody<{ email: string }>, res: Response) {
        const validationError = validationResult(req);
        if (!validationError.isEmpty()) return res.sendStatus(400);
        await this.authService.sendPasswordRecoveryCode(req.body.email);
        res.sendStatus(204);
    };

    async createNewUserPassword(req: RequestWithBody<{ newPassword: string, recoveryCode: string }>, res: Response) {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) return;
        await this.authService.changeUserPassword(req.body.newPassword, req.body.recoveryCode, req.context.userExtended!);
        res.sendStatus(204);
    }
}