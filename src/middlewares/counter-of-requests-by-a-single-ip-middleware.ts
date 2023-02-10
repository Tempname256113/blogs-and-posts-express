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
        [route: string]: {
            counter: number,
            firstRequestTime: Date,
            lastRequestTimeLimit: Date
        }
    }
}

type temporaryStorageForIpAddressesType = suspectedClientType[];

const temporaryStorageForIpAddresses: temporaryStorageForIpAddressesType = [
    {
    '127.0.0.0': {
        '/auth/login': {
            counter: 1,
            firstRequestTime: new Date(),
            lastRequestTimeLimit: new Date()
        }
    }
    }
];

const testObj = {
    '127.0.0.0': {
        '/auth/login': {
            counter: 1,
            firstRequestTime: new Date(),
            lastRequestTimeLimit: new Date()
        }
    }
}
const str = '127.0.0.0';

/* функция для проверки ip адреса на количество запросов в определенный интервал времени
* принимает параметры ip => ip, который нужно найти в хранилище и проверить количество его запросов за интервал времени
* timeLimit => лимит времени за который совершаются все возможные попытки запросов на защищенный роут
* count => количество запросов разрешенных за timeLimit интервал времени. если запросов будет больше этого числа то ip заблокируется
* route => роут, роут на котором проверяются попытки входа */
const checkIpAddress = (ip: string, timeLimit: number, count: number, route: string) => {
    const foundCurrentIpAddress = (temporaryIpAddressesStorage: temporaryStorageForIpAddressesType): string | undefined => {
        for (let value of temporaryIpAddressesStorage) {
            for (let ipAddress in value) {
                if (ipAddress === ip) {
                    return ipAddress;
                }
            }
        }
    }
    const foundedIpAddress = foundCurrentIpAddress(temporaryStorageForIpAddresses);
    if (!foundedIpAddress) {
        const currentDate = new Date();
        const suspectedClient: suspectedClientType = {
            [ip]: {
                [route]: {
                    counter: 1,
                    firstRequestTime: currentDate,
                    lastRequestTimeLimit: add(currentDate, {seconds: timeLimit})
                }
            }
        }
    } else {
        // const foundedCurrentRoute = foundedIpAddress.
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
            storage: function(){}
        }
    } else {
        config = {
            timeLimit: config.timeLimit ?? 10,
            count: config.count ?? 6,
            blockTime: config.blockTime ?? 30,
            storage: config.storage ?? function (){}
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