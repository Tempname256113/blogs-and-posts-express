import {blogsRepository} from "../repositories/blogs/blogs-repository";
import {BlogType, RequestBlogType} from "../models/blog-models";
import {RequestPostType} from "../models/post-models";
import {postsService} from "./posts-service";
import {v4 as uuid4} from 'uuid';
import {blogsQueryRepository} from "../repositories/blogs/blogs-query-repository";

class BlogsService {
    async createNewBlog(newBlog: RequestBlogType): Promise<BlogType> {
        const newBlogTemplate: BlogType = {
            id: uuid4(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: new Date().toISOString()
        };
        return blogsRepository.createNewBlog(newBlogTemplate);
    };
    async createNewPostForSpecificBlog(newPost: RequestPostType) {
        return postsService.createNewPost(newPost);
    };
    // возвращает false если такого объекта в базе данных нет
    // и true если операция прошла успешно
    async updateBlogByID(id: string, requestBlog: RequestBlogType): Promise<boolean> {
        const foundedBlog: BlogType | null = await blogsQueryRepository.getBlogByID(id);
        if (!foundedBlog) return  false;
        await blogsRepository.updateBlogByID(id, requestBlog);
        return true;
    };
    async deleteBlogByID(id: string): Promise<boolean> {
        return  blogsRepository.deleteBlogByID(id);
    };
    async deleteAllData(): Promise<void> {
        await blogsRepository.deleteAllData();
    }
}

export const blogsService = new BlogsService();