import {NextFunction, Request, Response} from "express";
import {jwtMethods} from "../routes/application/jwtMethods";
import {accessTokenPayloadType} from "../models/tokenModels";

/* добавляет к объекту запроса context где context = {
JWT_PAYLOAD: {userId: string, iat: number}
}
также если находит ошибки в присылаемом токене отправляет 401 статус */
export const bearerUserAuthTokenCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const reqToken: string | undefined = req.headers.authorization;
    if (reqToken) {
        const accessTokenPayload: accessTokenPayloadType | null = jwtMethods.compareToken.accessToken(reqToken);
        if (accessTokenPayload) {
            req.context = {
                JWT_PAYLOAD: accessTokenPayload
            }
            return next();
        }
        return res.sendStatus(401);
    }
    res.sendStatus(401);
}