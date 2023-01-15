import {blogsRepository} from "../repositories/blogs/blogsRepository";
import {blogType, requestBlogType} from "../models/blogModels";
import {requestPostType} from "../models/postModels";
import {postsService} from "./postsService";

export const blogsService = {
    async createNewBlog(newBlog: requestBlogType): Promise<blogType> {
        const newBlogTemplate: blogType = {
            id: 'id' + new Date().getTime(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: new Date().toISOString()
        };
        return blogsRepository.createNewBlog(newBlogTemplate);
    },
    async createNewPostForSpecificBlog(newPost: requestPostType) {
        return postsService.createNewPost(newPost);
    },
    async updateBlogByID(id: string, blog: requestBlogType): Promise<boolean> {
        return  blogsRepository.updateBlogByID(id, blog);
    },
    async deleteBlogByID(id: string): Promise<boolean> {
        return  blogsRepository.deleteBlogByID(id);
    },
    async findBlogNameByID(id: string): Promise<void | string> {
        return  blogsRepository.findBlogNameByID(id);
    },
    async deleteAllData(): Promise<void> {
        await blogsRepository.deleteAllData();
    }
}