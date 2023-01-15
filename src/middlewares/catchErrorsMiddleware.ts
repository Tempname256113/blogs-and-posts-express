import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";
import {errorObjType, insideErrorObjType} from "../models/errorObjModel";

// сюда нужно передать массив ошибок который приходит в случае неправильных входных данных
const createErrorMessage = (array: any): errorObjType => {

    const arrayWithErrors: insideErrorObjType[] = [];

    for (const i of array) {

        if (arrayWithErrors.find(elem => elem.field === i.param)) {
            continue;
        }
        arrayWithErrors.push({
            message: 'i got the wrong value',
            field: i.param
        })
    }

    return {errorsMessages: arrayWithErrors}
}
// приводит вид ошибок к нужному виду. писать в конце цепи после всех методов express-validator.
// собирает все ошибки найденные express-validator, приводит к нужному виду и передает на клиент со статусом 400
export const catchErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(createErrorMessage(errors.array()));
    }
    next();
}