import {Request, Response, NextFunction} from "express";
import {refreshTokenPayloadType} from "../models/token-models";
import {jwtMethods} from "../routes/application/jwt-methods";
import {
    refreshTokensBlackListQueryRepository
} from "../repositories/refreshTokensBlackList/refresh-tokens-black-list-query-repository";

const refreshTokenString: string = 'refreshToken';

/* проверяет есть ли в запросе куки. если есть то расшифровывает и мутирует объект запроса.
req.context = {
JWT_PAYLOAD: decodedRefreshToken,
refreshTokenFromCookie: refreshToken} */
export const checkRequestRefreshTokenCookieMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshTokenFromCookie: string | undefined = req.cookies[refreshTokenString];
    if (refreshTokenFromCookie) {
        const decodedRefreshToken: refreshTokenPayloadType | null = jwtMethods.compareToken.refreshToken(refreshTokenFromCookie);
        if (decodedRefreshToken) {
            const foundedUserWithExpiredRefreshTokenInDB = await refreshTokensBlackListQueryRepository.getBannedRefreshToken(refreshTokenFromCookie);
            /* если в базе данных нашлась запись с заблокированным рефреш токеном у этого пользователя значит он пытается выдать себя за другого.
            система это не пропустит, некорректный токен */
            if (foundedUserWithExpiredRefreshTokenInDB) {
                return res.sendStatus(401);
            }
            req.context = {
                JWT_PAYLOAD: decodedRefreshToken,
                refreshTokenFromCookie
            }
            next();
        } else {
            res.send(401);
        }
    } else {
        res.send(401);
    }
}