import {NextFunction, Request, Response} from "express";
import {blogsQueryRepository} from "../repositories/blogs/blogs-query-repository";

export const blogIdUriParamCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const blog = await blogsQueryRepository.getBlogByID(req.params.blogId);
    blog ? next() : res.sendStatus(404);
}