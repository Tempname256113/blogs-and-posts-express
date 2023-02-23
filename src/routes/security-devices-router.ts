import {Router, Request, Response} from "express";
import {checkRequestRefreshTokenCookieMiddleware} from "../middlewares/check-request-refreshToken-cookie-middleware";
import {authQueryRepository} from "../repositories/auth/auth-query-repository";
import {refreshTokenPayloadType} from "../models/token-models";
import {userSessionsDataType, sessionType} from "../models/session-models";
import {format} from "date-fns";
import {RequestWithURIParams, ResponseWithBody} from "../models/req-res-models";
import {authService} from "../domain/auth-service";


export const securityDevicesRouter = Router();

securityDevicesRouter.get('/',
    checkRequestRefreshTokenCookieMiddleware,
    async (req: Request, res: ResponseWithBody<userSessionsDataType[]>) => {
    const {userId} = req.context.refreshTokenPayload as refreshTokenPayloadType;
    const sessionsArrayOfCurrentUser: userSessionsDataType[] = [];
    const sessionsHandler = (session: sessionType): void => {
        const converterSecondsToStringDate = (seconds: number): string => {
            const milliseconds = seconds * 1000;
            const date = new Date(milliseconds);
            return date.toISOString();
        };
        const {userIp, userDeviceName, issuedAt, deviceId} = session;
        const lastActivateDate = converterSecondsToStringDate(issuedAt);
        const userSessionData: userSessionsDataType = {
            ip: userIp,
            title: userDeviceName,
            lastActivateDate,
            deviceId
        }
        sessionsArrayOfCurrentUser.push(userSessionData);
    }
    await authQueryRepository.getAllSessionsByUserId(userId).forEach(sessionsHandler);
    res.status(200).send(sessionsArrayOfCurrentUser);
});

securityDevicesRouter.delete('/', 
    checkRequestRefreshTokenCookieMiddleware,
    async (req: Request, res: Response) => {
    const {userId, deviceId} = req.context.refreshTokenPayload as refreshTokenPayloadType;
    await authService.deleteAllSessionsExceptCurrent(userId, deviceId);
    res.sendStatus(204);
});

securityDevicesRouter.delete('/:deviceId',
    checkRequestRefreshTokenCookieMiddleware,
    async (req: RequestWithURIParams<{deviceId: string}>, res: Response) => {
    const {userId} = req.context.refreshTokenPayload as refreshTokenPayloadType;
    const foundedSessionByDeviceId: sessionType | null = await authQueryRepository.getSessionByDeviceId(req.params.deviceId);
    if (!foundedSessionByDeviceId) return res.sendStatus(404);
    const checkOwnershipSession = (): boolean => {
        return foundedSessionByDeviceId.userId === userId;
    };
    const ownershipSessionStatus: boolean = checkOwnershipSession();
    if (!ownershipSessionStatus) return res.sendStatus(403);
    await authService.deleteSessionByDeviceId(req.params.deviceId);
});