import {blogsRepositoryDB} from "../repositories/blogs/blogsRepositoryDB";
import {blogType, requestBlogType} from "../models/blogModels";
import {requestPostType} from "../models/postModels";
import {postsService} from "./postsService";

export const blogsService = {
    async getAllBlogs() {
        return await blogsRepositoryDB.getAllBlogs();
    },
    async createNewBlog(newBlog: requestBlogType): Promise<blogType> {
        const newBlogTemplate: blogType = {
            id: 'id' + (new Date()).getTime(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: new Date().toISOString()
        };
        return await blogsRepositoryDB.createNewBlog(newBlogTemplate);
    },
    async createNewPostForSpecificBlog(newPost: requestPostType) {
        return await postsService.createNewPost(newPost);
    },
    async getBlogByID(id: string) {
        return await blogsRepositoryDB.getBlogByID(id);
    },
    async updateBlogByID(id: string, blog: requestBlogType): Promise<boolean> {
        return await blogsRepositoryDB.updateBlogByID(id, blog);
    },
    async deleteBlogByID(id: string): Promise<boolean> {
        return await blogsRepositoryDB.deleteBlogByID(id);
    },
    async findBlogNameByID(id: string): Promise<void | string> {
        return await blogsRepositoryDB.findBlogNameByID(id);
    },
    async deleteAllData(): Promise<void> {
        await blogsRepositoryDB.deleteAllData();
    }
}