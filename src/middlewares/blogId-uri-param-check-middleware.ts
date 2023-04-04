import {NextFunction, Request, Response} from "express";
import {BlogsQueryRepository} from "../repositories/blogs/blogs-query-repository";
import {container} from "../composition-root";

const blogsQueryRepository = container.resolve(BlogsQueryRepository);

export const blogIdUriParamCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const blog = await blogsQueryRepository.getBlogByID(req.params.blogId);
    blog ? next() : res.sendStatus(404);
}