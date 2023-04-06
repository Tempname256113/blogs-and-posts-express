import {PostInTheDBType, RequestPostType} from "../models/post-models";
import {PostsRepository} from "../repositories/posts/posts-repository";
import {BlogsQueryRepository} from "../repositories/blogs/blogs-query-repository";
import {BlogType} from "../models/blog-models";
import {v4 as uuid4} from "uuid";
import {injectable} from "inversify";

@injectable()
export class PostsService {
    constructor(
        protected blogsQueryRepository: BlogsQueryRepository,
        protected postsRepository: PostsRepository
    ) {}
    async createNewPost(newPost: RequestPostType): Promise<PostInTheDBType> {
        /* blog придет потому что роут который обращается к этому сервису на уровне представления с помощью middleware
        уже проверил существует этот blog в базе данных или нет. если запрос дошел сюда, то он существует.
        еще одну проверку здесь делать не надо
        */
        const blog: BlogType | null = await this.blogsQueryRepository.getBlogByID(newPost.blogId);
        const newPostTemplate: PostInTheDBType = {
            id: uuid4(),
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        }
        return this.postsRepository.createNewPost(newPostTemplate);
    };
    async updatePostByID(id: string, requestPost: RequestPostType): Promise<boolean> {
        return this.postsRepository.updatePostByID(id, requestPost);
    };
    async deletePostByID(id: string): Promise<boolean> {
        return this.postsRepository.deletePostByID(id);
    };
    async deleteAllData(): Promise<void> {
        await this.postsRepository.deleteAllData();
    }
}