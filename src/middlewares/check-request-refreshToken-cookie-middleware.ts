import {Request, Response, NextFunction} from "express";
import {refreshTokenPayloadType} from "../models/token-models";
import {jwtMethods} from "../routes/application/jwt-methods";
import {authQueryRepository} from "../repositories/auth/auth-query-repository";
import {sessionType} from "../domain/auth-service";

const refreshTokenPropTitle: string = 'refreshToken';

/* мидлвар полностью проверяет приходящий с запросом рефреш токен чтобы можно было выдать новую пару токенов.
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
    const compareRefreshToken = (refreshToken: string): refreshTokenPayloadType | null => {
        return jwtMethods.compareToken.refreshToken(refreshToken);
    };
    if (!refreshTokenFromCookie) return res.sendStatus(401);
    const checkRefreshTokenValidity = (): boolean => {
        const refreshTokenPayload: refreshTokenPayloadType | null = compareRefreshToken(refreshTokenFromCookie);
        return refreshTokenPayload ? true : false;
    }
    const refreshTokenIsValid: boolean = checkRefreshTokenValidity();
    if (!refreshTokenIsValid) return res.sendStatus(401);
    const {
        userId,
        deviceId,
        iat,
        exp
    } = compareRefreshToken(refreshTokenFromCookie) as refreshTokenPayloadType;
    const findSessionByDeviceId = (): Promise<sessionType | null> => {
        return authQueryRepository.getSessionByDeviceId(deviceId);
    }
    const foundedSessionByDeviceIdFromDB: sessionType | null = await findSessionByDeviceId();
    if (!foundedSessionByDeviceIdFromDB) return res.sendStatus(401);
    const checkVersionsOfRefreshTokens = (): boolean => {
        const requestRefreshTokenVersion = iat;
        const refreshTokenVersionFromDB = foundedSessionByDeviceIdFromDB.issuedAt;
        return refreshTokenVersionFromDB === requestRefreshTokenVersion;
    }
    const compareRefreshTokensVersionsStatus: boolean = checkVersionsOfRefreshTokens();
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