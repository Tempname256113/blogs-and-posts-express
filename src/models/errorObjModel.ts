
// такие объекты приходят в случае ошибок
interface insideErrorObj {
    message: string,
    field: string
}

export interface IErrorObj {
    errorsMessages: insideErrorObj[];
}