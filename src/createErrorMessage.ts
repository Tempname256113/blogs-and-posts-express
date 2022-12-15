

import {IErrorObj} from "./models/models";

// сюда нужно передать массив ошибок который приходит в случае неправильных входных данных
export const createErrorMessage = (array: any): IErrorObj => {

    const arrayWithErrors: { message: string, field: string }[] = [];

        for (let i = 0; i < array.length; i++) {

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