import {NextFunction, Request, Response} from "express";
import {requestLimiterRepository} from "../repositories/request-limiter-middleware/request-limiter-repository";
import {secondsToMilliseconds} from "date-fns";

export type RequestLimiterDataType = {
    ip: string,
    routeUrl: string,
    time: Date
}

export type BannedIpAddressType = {
    ip: string,
    routeUrl: string,
    time: Date
}

export const requestLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const interval = 10 * 1000
    const currentIp: string = req.ip;
    const routeUrl: string = req.url;
    console.log(routeUrl, 'current url')
    console.log(currentIp, 'currentIp')
    const currentDate = new Date()
    const attemptsTime = new Date(currentDate.getTime() - interval)
    const attemptsCount: number = await requestLimiterRepository.findBannedIpAddress({ip: currentIp, routeUrl, time: attemptsTime});
    await requestLimiterRepository.addRequestData({ip: currentIp, routeUrl, time: currentDate})
    if(attemptsCount < 5) {
        console.log(attemptsCount, 'attempts count')
        next();
    } else {
        res.sendStatus(429)
    }
};