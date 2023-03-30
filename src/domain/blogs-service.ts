import {BlogsRepository} from "../repositories/blogs/blogs-repository";
import {BlogType, RequestBlogType} from "../models/blog-models";
import {RequestPostType} from "../models/post-models";
import {PostsService} from "./posts-service";
import {v4 as uuid4} from 'uuid';
import {BlogsQueryRepository} from "../repositories/blogs/blogs-query-repository";

export class BlogsService {
    constructor(
        protected blogsRepository: BlogsRepository,
        protected postsService: PostsService,
        protected blogsQueryRepository: BlogsQueryRepository
    ) {}
    async createNewBlog(newBlog: RequestBlogType): Promise<BlogType> {
        const newBlogTemplate: BlogType = {
            id: uuid4(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: new Date().toISOString()
        };
        return this.blogsRepository.createNewBlog(newBlogTemplate);
    };
    async createNewPostForSpecificBlog(newPost: RequestPostType) {
        return this.postsService.createNewPost(newPost);
    };
    // возвращает false если такого объекта в базе данных нет
    // и true если операция прошла успешно
    async updateBlogByID(id: string, requestBlog: RequestBlogType): Promise<boolean> {
        const foundedBlog: BlogType | null = await this.blogsQueryRepository.getBlogByID(id);
        if (!foundedBlog) return  false;
        await this.blogsRepository.updateBlogByID(id, requestBlog);
        return true;
    };
    async deleteBlogByID(id: string): Promise<boolean> {
        return this.blogsRepository.deleteBlogByID(id);
    };
    async deleteAllData(): Promise<void> {
        await this.blogsRepository.deleteAllData();
    }
}