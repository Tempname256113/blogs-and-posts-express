import {NextFunction, Request, Response} from "express";
import {jwtMethods} from "../routes/application/jwtMethods";
import {userTokenPayloadType} from "../models/tokenModels";

/* добавляет к объекту запроса context где context = {
JWT_PAYLOAD: {userId: string, iat: number}
}
также если находит ошибки в присылаемом токене отправляет 401 статус */
export const bearerUserAuthTokenCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        try {
            const tokenPayload: userTokenPayloadType | Error = await jwtMethods.compareUserAuthToken(req.headers.authorization);
            if ('userId' in tokenPayload) {
                req.context = {
                    JWT_PAYLOAD: tokenPayload
                };
            }
            return next();
        } catch (e) {
            return res.sendStatus(401);
        }
    }
    res.sendStatus(401);
}