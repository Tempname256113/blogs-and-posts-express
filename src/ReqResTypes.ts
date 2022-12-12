
import {Request, Response} from "express";

export type RequestWithBody<T> = Request<{}, {}, T>