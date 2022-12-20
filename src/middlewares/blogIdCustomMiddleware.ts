import {blogsRepositoryDB} from "../repositories/blogsRepositoryDB";

export const blogIdCustomMiddleware = async (req: any) => {
    if (await blogsRepositoryDB.findBlogNameByID(req.body.blogId) === 'undefined') {
        throw new Error('invalid blog id!');
    }
    return true;
}
