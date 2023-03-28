import {PostType, RequestPostType} from "../models/post-models";
import {postsRepository} from "../repositories/posts/posts-repository";
import {blogsQueryRepository} from "../repositories/blogs/blogs-query-repository";
import {BlogType} from "../models/blog-models";
import {v4 as uuid4} from "uuid";

export class PostsService {
    async createNewPost(newPost: RequestPostType): Promise<PostType> {
        /* blog придет потому что роут который обращается к этому сервису на уровне представления с помощью middleware
        уже проверил существует этот blog в базе данных или нет. если запрос дошел сюда, то он существует.
        еще одну проверку здесь делать не надо
        */
        const blog: BlogType | null = await blogsQueryRepository.getBlogByID(newPost.blogId);
        const newPostTemplate: PostType = {
            id: uuid4(),
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        }
        return postsRepository.createNewPost(newPostTemplate);
    };
    async updatePostByID(id: string, requestPost: RequestPostType): Promise<boolean> {
        return postsRepository.updatePostByID(id, requestPost);
    };
    async deletePostByID(id: string): Promise<boolean> {
        return postsRepository.deletePostByID(id);
    };
    async deleteAllData(): Promise<void> {
        await postsRepository.deleteAllData();
    }
}

export const postsService = new PostsService();