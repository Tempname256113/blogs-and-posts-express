
// такие объекты приходят в случае ошибок
export type InsideErrorObjType = {
    message: string,
    field: string
}

export type ErrorObjType = {
    errorsMessages: InsideErrorObjType[];
}