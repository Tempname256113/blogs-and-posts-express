import {IRequestBlogModel} from "../models/RequestBlogModel";
import {IBlog} from "../models/BlogModel";

const blogsArrayDB: IBlog[] = [];
let id: number = 0;

export const blogsRepository = {
    getAllBlogs(): IBlog[] {
        return blogsArrayDB;
    },
    createNewBlog(newBlog: IRequestBlogModel): IBlog{
        id++;
        const createdBlog: IBlog = {
            id: id,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl
        };
        blogsArrayDB.push(createdBlog);
        return createdBlog;
    }
}