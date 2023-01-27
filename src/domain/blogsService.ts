import {blogsRepository} from "../repositories/blogs/blogsRepository";
import {blogType, requestBlogType} from "../models/blogModels";
import {requestPostType} from "../models/postModels";
import {postsService} from "./postsService";
import {v4 as uuid4} from 'uuid';
import {blogsQueryRepository} from "../repositories/blogs/blogsQueryRepository";

export const blogsService = {
    async createNewBlog(newBlog: requestBlogType): Promise<blogType> {
        const newBlogTemplate: blogType = {
            id: uuid4(),
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
    // возвращает false если такого объекта в базе данных нет
    // и true если операция прошла успешно
    async updateBlogByID(id: string, requestBlog: requestBlogType): Promise<boolean> {
        const foundedBlog: blogType | null = await blogsQueryRepository.getBlogByID(id);
        if (!foundedBlog) return  false;
        await blogsRepository.updateBlogByID(id, requestBlog);
        return true;
    },
    async deleteBlogByID(id: string): Promise<boolean> {
        return  blogsRepository.deleteBlogByID(id);
    },
    async deleteAllData(): Promise<void> {
        await blogsRepository.deleteAllData();
    }
}