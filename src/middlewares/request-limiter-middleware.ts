import {NextFunction, Request, Response} from "express";
import {requestLimiterRepository} from "../repositories/request-limiter-middleware/request-limiter-repository";

export type RequestLimiterDataType = {
    ip: string,
    routeUrl: string,
    time: Date
}

export const requestLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const interval: number = 10 * 1000;
    const currentIp: string = req.ip;
    const routeUrl: string = req.url;
    const currentDate = new Date();
    const lastAllowedRequestTime: Date = new Date(currentDate.getTime() - interval);
    const attemptsCount: number = await requestLimiterRepository.checkCountOfRequests({ip: currentIp, routeUrl, time: lastAllowedRequestTime});
    await requestLimiterRepository.addRequestData({ip: currentIp, routeUrl, time: currentDate});
    if(attemptsCount < 5) {
        next();
    } else {
        res.sendStatus(429);
    }
};