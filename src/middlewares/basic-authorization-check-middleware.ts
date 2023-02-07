import {NextFunction, Request, Response} from "express";

export const basicAuthorizationCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization !== 'Basic YWRtaW46cXdlcnR5') {
        return res.sendStatus(401)
    } else {
        next();
    }
}