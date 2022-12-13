
import {Request, Response} from "express";

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithURIParams<T> = Request<T>;
export type RequestWithURIParamsAndBody<T, Y> = Request<T, {}, Y>;