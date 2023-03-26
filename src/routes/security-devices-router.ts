import {Router, Request, Response} from "express";
import {checkRequestRefreshTokenCookieMiddleware} from "../middlewares/check-request-refreshToken-cookie-middleware";
import {authQueryRepository} from "../repositories/auth/auth-query-repository";
import {RefreshTokenPayloadType} from "../models/token-models";
import {UserSessionsDataType, SessionType} from "../models/session-models";
import {RequestWithURIParams, ResponseWithBody} from "../models/req-res-models";
import {authService} from "../domain/auth-service";

class SecurityDevicesController {
    async getAllUserSessions(req: Request, res: ResponseWithBody<UserSessionsDataType[]>){
        const {userId} = req.context.refreshTokenPayload as RefreshTokenPayloadType;
        const sessionsArrayOfCurrentUser: UserSessionsDataType[] = [];
        const sessionsHandler = (session: SessionType): void => {
            const converterSecondsToStringDate = (seconds: number): string => {
                const milliseconds: number = seconds * 1000;
                const date: Date = new Date(milliseconds);
                return date.toISOString();
            };
            const {userIp, userDeviceName, issuedAt, deviceId} = session;
            const lastActiveDate = converterSecondsToStringDate(issuedAt);
            const userSessionData: UserSessionsDataType = {
                ip: userIp,
                title: userDeviceName,
                lastActiveDate,
                deviceId
            }
            sessionsArrayOfCurrentUser.push(userSessionData);
        }
        const sessionsArray = await authQueryRepository.getAllSessionsByUserId(userId);
        sessionsArray.forEach(sessionsHandler);
        res.status(200).send(sessionsArrayOfCurrentUser);
    };
    async deleteAllSessionsExceptCurrent(req: Request, res: Response){
        const {userId, deviceId}: RefreshTokenPayloadType = req.context.refreshTokenPayload!;
        await authService.deleteAllSessionsExceptCurrent(userId, deviceId);
        res.sendStatus(204);
    };
    async deleteSessionByDeviceId(req: RequestWithURIParams<{deviceId: string}>, res: Response){
        const refreshTokenPayload: RefreshTokenPayloadType = req.context.refreshTokenPayload!;
        const foundedSessionByDeviceId: SessionType | null = await authQueryRepository.getSessionByDeviceId(req.params.deviceId);
        if (!foundedSessionByDeviceId) return res.sendStatus(404);
        const checkOwnershipSession = (): boolean => {
            return foundedSessionByDeviceId.userId === refreshTokenPayload.userId;
        };
        const ownershipSessionStatus: boolean = checkOwnershipSession();
        if (!ownershipSessionStatus) return res.sendStatus(403);
        await authService.deleteSessionByDeviceId(req.params.deviceId);
        res.sendStatus(204);
    }
}

const securityDevicesControllerInstance = new SecurityDevicesController();
export const securityDevicesRouter = Router();

securityDevicesRouter.get('/',
    checkRequestRefreshTokenCookieMiddleware,
    securityDevicesControllerInstance.getAllUserSessions
);

securityDevicesRouter.delete('/', 
    checkRequestRefreshTokenCookieMiddleware,
    securityDevicesControllerInstance.deleteAllSessionsExceptCurrent
);

securityDevicesRouter.delete('/:deviceId',
    checkRequestRefreshTokenCookieMiddleware,
    securityDevicesControllerInstance.deleteSessionByDeviceId
);