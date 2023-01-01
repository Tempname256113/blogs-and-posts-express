
// такие объекты приходят в случае ошибок
type insideErrorObjType = {
    message: string,
    field: string
}

export type errorObjType = {
    errorsMessages: insideErrorObjType[];
}