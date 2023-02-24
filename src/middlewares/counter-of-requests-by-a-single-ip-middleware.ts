import {NextFunction, Request, Response} from "express";
import {add} from "date-fns";

/* timeLimit => время за которое поступает нужное количество запросов
* count => количество разрешенных запросов за интервал timeLimit (выше этого числа будет бан ip адреса)
* unblockTime => время до разбана ip адресов */
type configType = {
    timeLimit: number,
    count: number,
    unblockTime: number,
}

type suspectedClientType = {
    [ip: string]: {
        counter: number,
        lastRequestTimeLimit: number
    }
}

type protectedRouteType = {
    [route: string]: suspectedClientType
}

type blockedIpAddressesAndRoutes = {
    [route: string]: {
        [ip: string]: number
    }
}

const temporaryStorageForIpAddresses: protectedRouteType = {}

const localStorageForBlockedIpAddresses: blockedIpAddressesAndRoutes = {}

// создание нового объекта с ip адресом подозреваемого клиента
const addNewIpAddressToTemporaryStorage = (
    {ip, route, timeLimit}: {ip: string, route: string, timeLimit: number}): void => {
    temporaryStorageForIpAddresses[route][ip] = {
        counter: 1,
        lastRequestTimeLimit: timeLimit,
    }
}

// функция для проверки ip адреса на его существование в хранилище или его добавление
const checkExistenceOrCreateIpAddressAndRoutes = ({ip, route, timeLimit}: {ip: string, route: string, timeLimit: number}) => {
    const checkTheExistenceOfTheCurrentRoute = (): boolean => {
        return temporaryStorageForIpAddresses.hasOwnProperty(route);
    }
    const existenceRouteStatus: boolean = checkTheExistenceOfTheCurrentRoute();
    if (!existenceRouteStatus) temporaryStorageForIpAddresses[route] = {};
    const checkTheExistenceOfTheCurrentIpAddress = (): boolean => {
        for (let route in temporaryStorageForIpAddresses) {
            if (temporaryStorageForIpAddresses[route].hasOwnProperty(ip)) return true;
        }
        return false;
    }
    const foundedIpAddress: boolean = checkTheExistenceOfTheCurrentIpAddress();
    if (!foundedIpAddress) addNewIpAddressToTemporaryStorage({timeLimit, ip, route});
}

/* проверяет существование роута в хранилище для заблокированных ip адресов */
const checkExistenceOrCreateRouteForBannedIpAddresses = ({route}: {route: string}): void => {
    if (!localStorageForBlockedIpAddresses.hasOwnProperty(route))
        localStorageForBlockedIpAddresses[route] = {};
}

// блокировка ip адреса
const banIpAddress = (
    {ip, route, unblockTime}: {ip: string, route: string, unblockTime: number}): void => {
    checkExistenceOrCreateRouteForBannedIpAddresses({route});
    localStorageForBlockedIpAddresses[route][ip] = unblockTime;
}

// поиск заблокированного ip адреса
const findBannedIpAddress = (
    {ip, route}: {ip: string, route: string}): boolean => {
    checkExistenceOrCreateRouteForBannedIpAddresses({route});
    return localStorageForBlockedIpAddresses[route].hasOwnProperty(ip);
}

/* функция будет запускаться при каждом запросе и
* очищать неактуальные подозреваемые ip адреса */
const clearNotValidSuspectedIpAddresses = (): void => {
    for (let route in temporaryStorageForIpAddresses) {
        for (let ip in temporaryStorageForIpAddresses[route]) {
             if (new Date().getTime() >= temporaryStorageForIpAddresses[route][ip].lastRequestTimeLimit) {
                delete temporaryStorageForIpAddresses[route][ip];
            }
        }
    }
}

// чистит заблокированные ip адреса у которых истекло время блокировки
const clearNotValidBannedIpAddresses = (): void => {
    for (let route in localStorageForBlockedIpAddresses) {
        for (let ip in localStorageForBlockedIpAddresses[route]) {
             if (new Date().getTime() >= localStorageForBlockedIpAddresses[route][ip]) {
                delete localStorageForBlockedIpAddresses[route][ip];
            }
        }
    }
}

// увеличивает счетчик ip адреса при запросе
const increaseRequestCounter = (
    {ip, route}: {ip: string, route: string}): void => {
    temporaryStorageForIpAddresses[route][ip].counter++;
}

// проверяет количество запросов за определенный интервал времени и блокирует ip адреса
const checkRequestCounterForBanIpAddress = (
    {
        ip,
        route,
        count,
        unblockTime,
    }:
        {
        ip: string,
        route: string,
        count: number,
        unblockTime: number
        }
) => {
    if (temporaryStorageForIpAddresses[route][ip].counter > count) {
        if (new Date().getTime() <= temporaryStorageForIpAddresses[route][ip].lastRequestTimeLimit)
            banIpAddress({ip, route, unblockTime});
    }
}

/* принимает параметры:
* timeLimit (default 10s) = время за которое поступает нужное количество запросов
* count (default 6) = количество запросов за время указанное в timeLimit для блокировки ip для текущего роута
* unblockTime (default 10s) = время для блокировки ip на текущем роуте */
// const counterOfRequestsByASingleIpMiddlewareConfig = (
//     {
//         timeLimit = add(new Date(), {seconds: 10}).getTime(),
//         count = 5,
//         unblockTime = add(new Date(), {seconds: 10}).getTime()
//     }: configType
// ): (req: Request, res: Response, next: NextFunction) => any => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         const ip = req.ip;
//         const route = req.originalUrl;
//         clearNotValidBannedIpAddresses();
//         clearNotValidSuspectedIpAddresses();
//         const foundedBannedIpAddress: boolean = findBannedIpAddress({ip, route});
//         if (foundedBannedIpAddress) return res.sendStatus(429);
//         checkExistenceOrCreateIpAddressAndRoutes({ip, route, timeLimit});
//         increaseRequestCounter({ip, route});
//         checkRequestCounterForBanIpAddress({ip, route, count, unblockTime});
//         next();
//     };
// }

export const counterOfRequestsByASingleIpMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const objConfig: configType = {
        timeLimit: add(new Date(), {seconds: 10}).getTime(),
        count: 5,
        unblockTime: add(new Date(), {minutes: 30}).getTime() //unblockTime was 10s
    };
    const {timeLimit, count, unblockTime} = objConfig;
    const ip = req.ip;
    const route = req.url;
    clearNotValidBannedIpAddresses();
    clearNotValidSuspectedIpAddresses();
    const foundedBannedIpAddress: boolean = findBannedIpAddress({ip, route});
    if (foundedBannedIpAddress) return res.sendStatus(429);
    checkExistenceOrCreateIpAddressAndRoutes({ip, route, timeLimit});
    increaseRequestCounter({ip, route});
    checkRequestCounterForBanIpAddress({ip, route, count, unblockTime});
    next();
};