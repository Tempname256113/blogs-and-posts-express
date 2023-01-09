import {NextFunction, Request, Response} from "express";

export const authorizationCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization !== 'Basic YWRtaW46cXdlcnR5') {
        return res.status(401).end();
    } else {
        next();
    }
}