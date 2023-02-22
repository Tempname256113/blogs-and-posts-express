import {Request, Response, NextFunction} from "express";
import {refreshTokenPayloadType} from "../models/token-models";
import {jwtMethods} from "../routes/application/jwt-methods";
import {authQueryRepository} from "../repositories/auth/auth-query-repository";
import {sessionType} from "../models/session-models";

const refreshTokenPropTitle: string = 'refreshToken';

/* мидлвар полностью проверяет приходящий с запросом рефреш токен.
* в случае ошибок отсылает ответ с 401 статусом.
* мутирует объект запроса добавляя к нему новые свойства =>
* req.context = {
        refreshTokenPayload: {
            userId: string,
            deviceId: string,
            iat: number,
            exp: number
        }
    } */
export const checkRequestRefreshTokenCookieMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshTokenFromCookie: string | undefined = req.cookies[refreshTokenPropTitle];
    if (!refreshTokenFromCookie) return res.sendStatus(401);
    const verifyRefreshToken = (refreshToken: string): refreshTokenPayloadType | null => {
        return jwtMethods.compareToken.refreshToken(refreshToken);
    };
    const checkRefreshTokenValidity = (): boolean => {
        const refreshTokenPayload: refreshTokenPayloadType | null = verifyRefreshToken(refreshTokenFromCookie);
        return refreshTokenPayload ? true : false;
    }
    const refreshTokenIsValid: boolean = checkRefreshTokenValidity();
    if (!refreshTokenIsValid) return res.sendStatus(401);
    const {
        userId,
        deviceId,
        iat,
        exp
    } = verifyRefreshToken(refreshTokenFromCookie) as refreshTokenPayloadType;
    const findSessionByDeviceId = (): Promise<sessionType | null> => {
        return authQueryRepository.getSessionByDeviceId(deviceId);
    }
    const foundedSessionByDeviceIdFromDB: sessionType | null = await findSessionByDeviceId();
    if (!foundedSessionByDeviceIdFromDB) return res.sendStatus(401);
    const compareVersionsOfRefreshTokens = (): boolean => {
        const requestRefreshTokenVersion = iat;
        const DBRefreshTokenVersion = foundedSessionByDeviceIdFromDB.issuedAt;
        return DBRefreshTokenVersion === requestRefreshTokenVersion;
    }
    const compareRefreshTokensVersionsStatus: boolean = compareVersionsOfRefreshTokens();
    if (!compareRefreshTokensVersionsStatus) return res.sendStatus(401);
    req.context = {
        refreshTokenPayload: {
            userId,
            deviceId,
            iat,
            exp
        }
    }
    next();
}