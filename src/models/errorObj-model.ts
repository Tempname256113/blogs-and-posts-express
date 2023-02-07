
// такие объекты приходят в случае ошибок
export type insideErrorObjType = {
    message: string,
    field: string
}

export type errorObjType = {
    errorsMessages: insideErrorObjType[];
}