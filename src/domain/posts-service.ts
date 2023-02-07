import {postType, requestPostType} from "../models/post-models";
import {postsRepository} from "../repositories/posts/posts-repository";
import {blogsQueryRepository} from "../repositories/blogs/blogs-query-repository";
import {blogType} from "../models/blog-models";
import {postsQueryRepository} from "../repositories/posts/posts-query-repository";
import {v4 as uuid4} from "uuid";

export const postsService = {
    async createNewPost(newPost: requestPostType): Promise<postType> {
        /* blog придет потому что роут который обращается к этому сервису на уровне представления с помощью middleware
        уже проверил существует этот blog в базе данных или нет. если запрос дошел сюда, то он существует.
        еще одну проверку здесь делать не надо
        */
        const blog: blogType | null = await blogsQueryRepository.getBlogByID(newPost.blogId);
        const newPostTemplate: postType = {
            id: uuid4(),
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        }
        return postsRepository.createNewPost(newPostTemplate);
    },
    async updatePostByID(id: string, requestPost: requestPostType): Promise<boolean> {
        const foundedPost: postType | null = await postsQueryRepository.getPostByID(id);
        if (!foundedPost) return false;
        await postsRepository.updatePostByID(id, requestPost);
        return true;
    },
    async deletePostByID(id: string): Promise<boolean> {
        return postsRepository.deletePostByID(id);
    },
    async deleteAllData(): Promise<void> {
        await postsRepository.deleteAllData();
    }
}