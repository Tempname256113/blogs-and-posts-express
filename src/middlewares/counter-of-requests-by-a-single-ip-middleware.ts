import {NextFunction, Request, Response} from "express";
import {add} from "date-fns";

/* timeLimit => время за которое поступает нужное количество запросов
* count => количество разрешенных запросов за интервал timeLimit (выше этого числа будет бан ip адреса)
* unblockTime => время разбана ip адресов */
type configType = {
    timeLimit?: number,
    count?: number,
    unblockTime?: number,
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

/* создание нового объекта с ip адресом подозреваемого клиента
* timeLimit => время для отслеживания количества запросов за заданный интервал.
* если в течение этого интервала будет количество запросов превышающее заданное,
* то ip будет заблокирован
* ip => ip адрес подозреваемого клиента
* route => роут к которому нужно добавить новый ip адрес */
const addNewIpAddressToTemporaryStorage = (
    {ip, route, timeLimit}: {ip: string, route: string, timeLimit: number}): void => {
    temporaryStorageForIpAddresses[route][ip] = {
        counter: 1,
        lastRequestTimeLimit: timeLimit,
    }
}

/* функция для проверки ip адреса на его существование в хранилище или его добавление
* принимает параметры ip => ip, который нужно найти в хранилище или добавить
* timeLimit => лимит времени за который совершаются все возможные попытки запросов на защищенный роут
* route => роут, на котором нужно найти приходящий ip адрес */
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

/* блокировка ip адреса
* ip => ip адрес клиента
* route => роут доступ к которому будет заблокирован для указанного ip адреса
* unblockTime => время до разблокировки указанного ip адреса */
const banIpAddress = (
    {ip, route, unblockTime}: {ip: string, route: string, unblockTime: number}): void => {
    localStorageForBlockedIpAddresses[route][ip] = unblockTime;
}

/* проверяет существование роута в хранилище для заблокированных ip адресов */
const checkExistenceOrCreateRouteForBannedIpAddresses = ({route}: {route: string}): void => {
    if (!localStorageForBlockedIpAddresses.hasOwnProperty(route))
        localStorageForBlockedIpAddresses[route] = {};
}

/* поиск заблокированного ip адреса
* ip => ip который нужно найти в списке заблокированных
* route => роут, по которому нужно найти заблокированный ip адрес */
const findBannedIpAddress = (
    {ip, route}: {ip: string, route: string}): boolean => {
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

/* чистит заблокированные ip адреса у которых истекло время блокировки */
const clearNotValidBannedIpAddresses = (): void => {
    for (let route in localStorageForBlockedIpAddresses) {
        for (let ip in localStorageForBlockedIpAddresses[route]) {
             if (new Date().getTime() >= localStorageForBlockedIpAddresses[route][ip]) {
                delete localStorageForBlockedIpAddresses[route][ip];
            }
        }
    }
}

/* увеличивает счетчик ip адреса при запросе
* route => по какому роуту нужно найти ip
* ip => ip адрес на котором нужно увеличить счетчик */
const increaseRequestCounter = (
    {ip, route}: {ip: string, route: string}): void => {
    temporaryStorageForIpAddresses[route][ip].counter++;
}

/* проверяет количество запросов за определенный интервал времени и блокирует ip адреса
* count => количество разрешенных запросов (выше этого числа идет блокировка)
* route => по какому роуту нужно искать
* ip => какой ip адрес проверить
* unblockTime => время в минутах до разблокировки указанного ip
* timeLimit => время в секундах для отслеживания количества запросов.
* если в течение этого интервала будет количество запросов превышающее заданное,
* то ip будет заблокирован */
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
* unblockTime (default 30min) = время для блокировки ip на текущем роуте
* storage = хранилище для заблокированных ip и роутов. нужно передать функцию для сохранения заблокированного ip в базе данных
* по дефолту будет в оперативной памяти */
const counterOfRequestsByASingleIpMiddlewareConfig = (
    {
        timeLimit = add(new Date(), {seconds: 10}).getTime(),
        count = 5,
        unblockTime = add(new Date(), {seconds: 10}).getTime()
    }: configType
): (req: Request, res: Response, next: NextFunction) => any => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip;
        const route = req.originalUrl;
        clearNotValidBannedIpAddresses();
        clearNotValidSuspectedIpAddresses();
        checkExistenceOrCreateRouteForBannedIpAddresses({route});
        const foundedBannedIpAddress: boolean = findBannedIpAddress({ip, route});
        if (foundedBannedIpAddress) return res.sendStatus(429);
        checkExistenceOrCreateIpAddressAndRoutes({ip, route, timeLimit});
        increaseRequestCounter({ip, route});
        checkRequestCounterForBanIpAddress({ip, route, count, unblockTime});
        console.log('temporaryStorageForIpAddresses:');
        console.log(temporaryStorageForIpAddresses);
        console.log('localStorageForBlockedIpAddresses:');
        console.log(localStorageForBlockedIpAddresses);
        next();
    };
}

export const counterOfRequestsByASingleIpMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const objConfig = {
        timeLimit: add(new Date(), {seconds: 10}).getTime(),
        count: 5,
        unblockTime: add(new Date(), {seconds: 10}).getTime()
    }
    const {timeLimit, count, unblockTime} = objConfig;
    const ip = req.ip;
    const route = req.originalUrl;
    clearNotValidBannedIpAddresses();
    clearNotValidSuspectedIpAddresses();
    checkExistenceOrCreateRouteForBannedIpAddresses({route});
    const foundedBannedIpAddress: boolean = findBannedIpAddress({ip, route});
    if (foundedBannedIpAddress) return res.sendStatus(429);
    checkExistenceOrCreateIpAddressAndRoutes({ip, route, timeLimit});
    increaseRequestCounter({ip, route});
    checkRequestCounterForBanIpAddress({ip, route, count, unblockTime});
    console.log('temporaryStorageForIpAddresses:');
    console.log(temporaryStorageForIpAddresses);
    console.log('localStorageForBlockedIpAddresses:');
    console.log(localStorageForBlockedIpAddresses);
    next();
};