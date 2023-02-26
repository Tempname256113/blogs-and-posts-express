import {NextFunction, Request, Response} from "express";
import {requestLimiterRepository} from "../repositories/request-limiter-middleware/request-limiter-repository";
import {secondsToMilliseconds} from "date-fns";

export type RequestLimiterDataType = {
    ip: string,
    routeUrl: string,
    timestamp: number
}

export type BannedIpAddressType = {
    ip: string,
    routeUrl: string
}

export const requestLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const convertDateToMilliseconds = (date: Date) => date.getTime();
    const currentIp: string = req.ip;
    const routeUrl: string = req.url;
    const ipAddressBannedOrNot: boolean = await requestLimiterRepository.findBannedIpAddress({ip: currentIp, routeUrl});
    if (ipAddressBannedOrNot) return res.sendStatus(429);
    const timestamp: number = convertDateToMilliseconds(new Date());
    const requestData: RequestLimiterDataType = {
        ip: currentIp,
        routeUrl,
        timestamp
    };
    requestLimiterRepository.addRequestData(requestData);
    const checkBanOrNot = async (): Promise<boolean> => {
        const timestamp: number = convertDateToMilliseconds(new Date()) - secondsToMilliseconds(10);
        const dataForChecking: RequestLimiterDataType = {
            ip: currentIp,
            routeUrl,
            timestamp
        };
        const quantityOfRequests = await requestLimiterRepository.getRequestDataQuantity(dataForChecking);
        return quantityOfRequests >= 4;
    };
    const shouldBan: boolean = await checkBanOrNot();
    if (shouldBan) requestLimiterRepository.banIpAddress({ip: currentIp, routeUrl});
    next();
};