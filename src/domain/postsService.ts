import {postType, requestPostType} from "../models/postModels";
import {postsRepository} from "../repositories/posts/postsRepository";
import {blogsService} from "./blogsService";

export const postsService = {
    async createNewPost(newPost: requestPostType): Promise<postType> {
        const newPostTemplate: postType = {
            id: 'id' + (new Date()).getTime(),
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: await blogsService.findBlogNameByID(newPost.blogId) as string,
            createdAt: new Date().toISOString()
        }
        return postsRepository.createNewPost(newPostTemplate)
    },
    async updatePostByID(id: string, post: requestPostType): Promise<boolean> {
        return postsRepository.updatePostByID(id, post);
    },
    async deletePostByID(id: string): Promise<boolean> {
        return postsRepository.deletePostByID(id);
    },
    async deleteAllData(): Promise<void> {
        await postsRepository.deleteAllData();
    }
}