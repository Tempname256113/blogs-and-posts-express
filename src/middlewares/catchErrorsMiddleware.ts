import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";
import {errorObjType} from "../models/errorObjModel";

// сюда нужно передать массив ошибок который приходит в случае неправильных входных данных
const createErrorMessage = (array: any): errorObjType => {

    const arrayWithErrors: { message: string, field: string }[] = [];

    //map
    // for in / of
    // for (let i = 0; i < array.length; i++) {
    for (const i of array) {

        if (arrayWithErrors.find(elem => elem.field === array[i]['param'])) {
            continue;
        }
        arrayWithErrors.push({
            message: 'string',
            field: array[i]['param']
        })
    }

    return {errorsMessages: arrayWithErrors}
}

export const catchErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(createErrorMessage(errors.array()));
    }
    next();
}