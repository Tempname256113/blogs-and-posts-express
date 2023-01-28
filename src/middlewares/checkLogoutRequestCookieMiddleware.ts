import {Request, Response, NextFunction} from "express";
import {refreshTokenPayloadType} from "../models/tokenModels";
import {jwtMethods} from "../routes/application/jwtMethods";

const refreshTokenString: string = 'refreshToken';

export const checkLogoutRequestCookieMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const refreshTokenFromCookie: string | undefined = req.cookies[refreshTokenString];
    if (refreshTokenFromCookie) {
        const decodedRefreshToken: refreshTokenPayloadType | null = jwtMethods.compareToken.refreshToken(refreshTokenFromCookie);
        if (decodedRefreshToken) {
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