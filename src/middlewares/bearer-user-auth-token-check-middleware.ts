import {NextFunction, Request, Response} from "express";
import {jwtMethods} from "../routes/application/jwt-methods";
import {accessTokenPayloadType} from "../models/token-models";

/* добавляет к объекту запроса context где context = {
accessTokenPayload: {userId: string, iat: number, exp: number}
}
также если находит ошибки в присылаемом токене отправляет 401 статус */
export const bearerUserAuthTokenCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const reqToken: string | undefined = req.headers.authorization;
    if (!reqToken) return res.sendStatus(401);
    const accessTokenPayload: accessTokenPayloadType | null = jwtMethods.compareToken.accessToken(reqToken);
    if (!accessTokenPayload) return res.sendStatus(401);
    req.context = {
        accessTokenPayload
    }
    next();
}