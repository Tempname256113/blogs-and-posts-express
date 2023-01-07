import {postType, requestPostType} from "../models/postModels";
import {postsRepositoryDB} from "../repositories/posts/postsRepositoryDB";
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
        return postsRepositoryDB.createNewPost(newPostTemplate)
    },
    async updatePostByID(id: string, post: requestPostType): Promise<boolean> {
        return postsRepositoryDB.updatePostByID(id, post);
    },
    async deletePostByID(id: string): Promise<boolean> {
        return postsRepositoryDB.deletePostByID(id);
    },
    async deleteAllData(): Promise<void> {
        await postsRepositoryDB.deleteAllData();
    }
}