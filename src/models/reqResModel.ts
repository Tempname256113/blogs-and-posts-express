
import {Request, Response} from "express";

export type queryHT04Type = {
    searchNameTerm?: string,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    pageNumber: number
    pageSize: number
}

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQueryHT04<T> = Request<{}, {}, {}, queryHT04Type>
export type RequestWithURIParams<T> = Request<T>;
export type RequestWithURIParamsAndBody<T, Y> = Request<T, {}, Y>;

export type ResponseWithBody<T> = Response<T>;