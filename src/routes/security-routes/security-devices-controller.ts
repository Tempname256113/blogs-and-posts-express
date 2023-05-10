import {AuthQueryRepository} from "../../repositories/auth/auth-query-repository";
import {AuthService} from "../../domain/auth-service";
import {Request, Response} from "express";
import {RequestWithURIParams, ResponseWithBody} from "../../models/req-res-models";
import {SessionType, UserSessionsDataType} from "../../models/session-models";
import {RefreshTokenPayloadType} from "../../models/token-models";
import {injectable} from "inversify";

@injectable()
export class SecurityDevicesController {
    constructor(protected authQueryRepository: AuthQueryRepository, protected authService: AuthService) {
    }

    async getAllUserSessions(req: Request, res: ResponseWithBody<UserSessionsDataType[]>) {
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
        const sessionsArray = await this.authQueryRepository.getAllSessionsByUserId(userId);
        sessionsArray.forEach(sessionsHandler);
        res.status(200).send(sessionsArrayOfCurrentUser);
    };

    async deleteAllSessionsExceptCurrent(req: Request, res: Response) {
        const {userId, deviceId}: RefreshTokenPayloadType = req.context.refreshTokenPayload!;
        await this.authService.deleteAllSessionsExceptCurrent(userId, deviceId);
        res.sendStatus(204);
    };

    async deleteSessionByDeviceId(req: RequestWithURIParams<{ deviceId: string }>, res: Response) {
        const refreshTokenPayload: RefreshTokenPayloadType = req.context.refreshTokenPayload!;
        const foundedSessionByDeviceId: SessionType | null = await this.authQueryRepository.getSessionByDeviceId(req.params.deviceId);
        if (!foundedSessionByDeviceId) return res.sendStatus(404);
        const checkOwnershipSession = (): boolean => {
            return foundedSessionByDeviceId.userId === refreshTokenPayload.userId;
        };
        const ownershipSessionStatus: boolean = checkOwnershipSession();
        if (!ownershipSessionStatus) return res.sendStatus(403);
        await this.authService.deleteSessionByDeviceId(req.params.deviceId);
        res.sendStatus(204);
    }
}