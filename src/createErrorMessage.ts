

// сюда нужно передать массив ошибок который приходит в случае неправильных входных данных
export const createErrorMessage = (array: any): {errorsMessages: {message: string, field: string}[]} => {

    const arrayWithErrors: { message: string, field: string }[] = [];

        for (let i = 0; i < array.length; i++) {

            if (arrayWithErrors.find(elem => elem.field === array[i]['param'])) {
                break;
            }
            arrayWithErrors.push({
                message: 'string',
                field: array[i]['param']
            })
        }

    return {errorsMessages: arrayWithErrors}
}