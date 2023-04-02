import {NextFunction, Request, Response} from "express";
import {jwtMethods} from "../routes/application/jwt-methods";
import {AccessTokenPayloadType} from "../models/token-models";

/* добавляет к объекту запроса новый объект context где context = {
accessTokenPayload: {userId: string, iat: number, exp: number}
}
также если находит ошибки в присылаемом токене отправляет 401 статус */
export const bearerUserAuthTokenCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const accessToken: string | undefined = req.headers.authorization;
    if (!accessToken) return res.sendStatus(401);
    const accessTokenPayload: AccessTokenPayloadType | null = jwtMethods.compareToken.accessToken(accessToken);
    if (!accessTokenPayload) return res.sendStatus(401);
    req.context = {
        accessTokenPayload
    }
    next();
}