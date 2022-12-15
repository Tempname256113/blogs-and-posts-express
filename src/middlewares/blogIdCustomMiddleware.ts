import {blogsRepository} from "../repositories/blogsRepository";

export const blogIdCustomMiddleware = (req: any) => {
    if (blogsRepository.findBlogNameByID(req.body.blogId) === 'undefined') {
        throw new Error('invalid blog id!');
    }
    return true;
}
