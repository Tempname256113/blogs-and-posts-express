
import {Request, Response} from "express";

export type reqQueryPagination = {
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
    pageNumber?: number,
    pageSize?: number
}

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithURIParamsAndQuery<T, Y> = Request<T, {}, {}, Y>
export type RequestWithURIParams<T> = Request<T>;
export type RequestWithURIParamsAndBody<T, Y> = Request<T, {}, Y>;

export type ResponseWithBody<T> = Response<T>;