import {NextFunction, Request, Response} from "express";
import {add} from "date-fns";

type configType = {
    timeLimit?: number,
    count?: number,
    blockTime?: number,
    storage?: () => any
}

type suspectedClientType = {
    [ip: string]: {
        counter: number,
        firstRequestTime: Date,
        lastRequestTimeLimit: Date
    }
}

type protectedRouteType = {
    [route: string]: suspectedClientType
}

type blockedIpAddress = {
    ip: string,
    unblockTime: Date
}

const temporaryStorageForIpAddresses: protectedRouteType = {
    '/auth/login': {
        '127.0.0.0': {
            counter: 1,
            firstRequestTime: new Date(),
            lastRequestTimeLimit: new Date()
        }
    },
    'auth/registration': {
        'c': {
            counter: 1,
            firstRequestTime: new Date(),
            lastRequestTimeLimit: new Date()
        }
    }
}

const localStorageForBlockedIpAddresses: blockedIpAddress[] = [];

const testObj = {
    '/auth/login': {
        '127.0.0.0': {
            counter: 1,
            firstRequestTime: new Date(),
            lastRequestTimeLimit: new Date()
        }
    }
}
const str = '127.0.0.0';
const str2 = '/auth/login';

/* создание нового объекта с ip адресом подозреваемого клиента */
const createSuspectedClientObj = (timeLimit: number, ip: string): suspectedClientType => {
    const currentDate = new Date();
    const suspectedClient: suspectedClientType = {
        [ip]: {
            counter: 1,
            firstRequestTime: currentDate,
            lastRequestTimeLimit: add(currentDate, {seconds: timeLimit})
        }
    }
    return suspectedClient;
}

/* функция для проверки ip адреса на его существование в хранилище или его добавление
* принимает параметры ip => ip, который нужно найти в хранилище или добавить
* timeLimit => лимит времени (в секундах) за который совершаются все возможные попытки запросов на защищенный роут
* route => роут, на котором нужно найти приходящий ip адрес */
const checkOrCreateIpAddressAndRoutes = (ip: string, timeLimit: number, route: string) => {
    const checkTheExistenceOfTheRoute = (routesStorage: protectedRouteType): void => {
        const checkTheExistenceOfTheRoute: boolean = routesStorage.hasOwnProperty(route);
        // если роута нет в списке, то он добавляется
        if (!checkTheExistenceOfTheRoute) temporaryStorageForIpAddresses[route] = {};
    }
    checkTheExistenceOfTheRoute(temporaryStorageForIpAddresses);
    const checkCurrentIpAddress = (temporaryIpAddressesStorage: protectedRouteType): boolean => {
        const currentSuspectedIp: boolean = temporaryIpAddressesStorage[route].hasOwnProperty(ip);
        if (currentSuspectedIp) {
            return true;
        } else {
            return false;
        }
    }
    const foundedIpAddress: boolean = checkCurrentIpAddress(temporaryStorageForIpAddresses);
    if (!foundedIpAddress) {
        const addNewIpAddressToTemporaryStorage = (temporaryIpAddressesStorage: protectedRouteType): void => {
            const temporaryStorageForIpAddressesContent = temporaryIpAddressesStorage[route];
            temporaryIpAddressesStorage[route] = {...temporaryStorageForIpAddressesContent, ...createSuspectedClientObj(timeLimit, ip)};
        }
        addNewIpAddressToTemporaryStorage(temporaryStorageForIpAddresses);
    }
}

/* блокировка ip адреса
* ip => ip адрес который нужно заблокировать
* unblockTime => время в минутах до разблокировки указанного ip */
const blockIpAddress = (ip: string, unblockTime: number): void => {
    const blockedIpAddress: blockedIpAddress = {
        ip,
        unblockTime: add(new Date, {minutes: unblockTime})
    }
    localStorageForBlockedIpAddresses.push(blockedIpAddress);
}

/* проверяет количество запросов за определенный интервал времени
* count => количество разрешенных запросов (выше этого числа идет блокировка)
* route => по какому роуту нужно искать
* ip => какой ip адрес проверить */
const checkRequestsCountForInterval = (count: number, route: string, ip: string) => {
    const suspectedIpAddress = temporaryStorageForIpAddresses[route][ip];
    if (suspectedIpAddress.counter > count) {
        
    }
}
// const d = new Date();
// const futureD = add(d, {seconds: 10});
// console.log(`d > futureD? => ${d > futureD}`); false
// console.log(`d < futureD? => ${d < futureD}`); true

/* принимает параметры:
* timeLimit (default 10s) = время в секундах за которое поступает нужное количество запросов
* count (default 6) = количество запросов за время указанное в time для блокировки ip для текущего роута
* blockTime (default 30m) = время в минутах для блокировки ip на текущем роуте
* storage = хранилище для заблокированных ip и роутов. нужно передать функцию для сохранения заблокированного ip в базе данных
* по дефолту будет в оперативной памяти */
export const counterOfRequestsByASingleIpMiddlewareConfig = (
    config?: configType
): (req: Request, res: Response, next: NextFunction) => void => {
    if (!config) {
        config = {
            timeLimit: 10,
            count: 6,
            blockTime: 30,
            storage: function () {
            }
        }
    } else {
        config = {
            timeLimit: config.timeLimit ?? 10,
            count: config.count ?? 6,
            blockTime: config.blockTime ?? 30,
            storage: config.storage ?? function () {
            }
        }
    }
    return (req: Request, res: Response, next: NextFunction) => {
        // if (localStorageForIpAddressess[0].count < 6) {
        //     localStorageForIpAddressess[0].id = req.ip;
        //     localStorageForIpAddressess[0].count++;
        //     console.log(localStorageForIpAddressess[0]);
        //     next();
        // } else {
        //     console.log(localStorageForIpAddressess[0]);
        //     res.sendStatus(429);
        // }
    };
}