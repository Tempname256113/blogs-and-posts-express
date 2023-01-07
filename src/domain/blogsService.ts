import {blogsRepositoryDB} from "../repositories/blogs/blogsRepositoryDB";
import {blogType, requestBlogType} from "../models/blogModels";
import {requestPostType} from "../models/postModels";
import {postsService} from "./postsService";

export const blogsService = {
    async createNewBlog(newBlog: requestBlogType): Promise<blogType> {
        const newBlogTemplate: blogType = {
            id: 'id' + (new Date()).getTime(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: new Date().toISOString()
        };
        return blogsRepositoryDB.createNewBlog(newBlogTemplate);
    },
    async createNewPostForSpecificBlog(newPost: requestPostType) {
        return postsService.createNewPost(newPost);
    },
    async updateBlogByID(id: string, blog: requestBlogType): Promise<boolean> {
        return  blogsRepositoryDB.updateBlogByID(id, blog);
    },
    async deleteBlogByID(id: string): Promise<boolean> {
        return  blogsRepositoryDB.deleteBlogByID(id);
    },
    async findBlogNameByID(id: string): Promise<void | string> {
        return  blogsRepositoryDB.findBlogNameByID(id);
    },
    async deleteAllData(): Promise<void> {
        await blogsRepositoryDB.deleteAllData();
    }
}