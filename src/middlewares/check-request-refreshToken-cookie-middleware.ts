import {Request, Response, NextFunction} from "express";
import {RefreshTokenPayloadType} from "../models/token-models";
import {jwtMethods} from "../routes/application/jwt-methods";
import {AuthQueryRepository} from "../repositories/auth/auth-query-repository";
import {SessionType} from "../models/session-models";
import {container} from "../composition-root";

const authQueryRepository = container.resolve(AuthQueryRepository);

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
    const checkRefreshTokenExistence = (): true | undefined => {
        if (!refreshTokenFromCookie) return true;
    }
    if (checkRefreshTokenExistence()) return res.sendStatus(401)

    const compareRefreshToken: (refreshTokenFromCookie: string) => RefreshTokenPayloadType | null
        = jwtMethods.compareToken.refreshToken;

    const verifyRefreshToken = (): true | undefined => {
        const refreshTokenIsValid: boolean = !!compareRefreshToken(refreshTokenFromCookie!);
        if (!refreshTokenIsValid) return true;
    }
    if (verifyRefreshToken()) return res.sendStatus(401);

    const refreshTokenPayload: RefreshTokenPayloadType = compareRefreshToken(refreshTokenFromCookie!)!;

    const findRefreshTokenInDBByDeviceId = async (): Promise<true | undefined> => {
        const foundedTokenByDeviceIdFromDB: SessionType | null = await authQueryRepository.getSessionByDeviceId(refreshTokenPayload.deviceId);
        if (!foundedTokenByDeviceIdFromDB) return true;
    }
    if (await findRefreshTokenInDBByDeviceId()) return res.sendStatus(401);

    const compareVersionsOfRefreshTokens = async (): Promise<true | undefined> => {
        const foundedSessionByDeviceIdFromDB: SessionType | null = await authQueryRepository.getSessionByDeviceId(refreshTokenPayload.deviceId);
        const requestRefreshTokenVersion = refreshTokenPayload.iat;
        const DBRefreshTokenVersion = foundedSessionByDeviceIdFromDB!.issuedAt;
        const compareRefreshTokensVersionsStatus: boolean = DBRefreshTokenVersion === requestRefreshTokenVersion;
        if (!compareRefreshTokensVersionsStatus) return true;
    }
    if (await compareVersionsOfRefreshTokens()) return res.sendStatus(401);

    req.context = {
        refreshTokenPayload: {
            userId: refreshTokenPayload.userId,
            deviceId: refreshTokenPayload.deviceId,
            iat: refreshTokenPayload.iat,
            exp: refreshTokenPayload.exp
        }
    }
    next();
}