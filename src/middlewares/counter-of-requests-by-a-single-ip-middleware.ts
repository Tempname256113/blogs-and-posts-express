import {NextFunction, Request, Response} from "express";

type counterOfRequestsType = {
    counter: number,
    lastRequestTime: Date
}

export type protectedRoutes = {
    ip: string,
    '/auth/login'?: counterOfRequestsType,
    '/auth/registration-confirmation'?: counterOfRequestsType,
    '/auth/registration'?: counterOfRequestsType,
    '/auth/registration-email-resending'?: counterOfRequestsType
}

const testArr = [{
    id: 'str',
    count: 0
}];

/* принимает параметры:
* time = время в секундах за которое поступает нужное количество запросов
* count = количество запросов за время указанное в time для блокировки ip для текущего роута
* storage = хранилище для заблокированных ip и роутов. нужно передать функцию для сохранения заблокированного ip в базе данных
* по дефолту будет в оперативной памяти */
export const counterOfRequestsByASingleIpMiddlewareConfig = (
    {time = 10, count = 6}: {
        time?: number,
        count?: number,
        storage?: () => any
    }
): (req: Request, res: Response, next: NextFunction) => void => {

    return (req: Request, res: Response, next: NextFunction) => {
        if (testArr[0].count < 6) {
            testArr[0].id = req.ip;
            testArr[0].count++;
            console.log(testArr[0]);
            next();
        } else {
            console.log(testArr[0]);
            res.sendStatus(429);
        }
    };
}