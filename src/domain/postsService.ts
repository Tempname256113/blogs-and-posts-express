import {postType, requestPostType} from "../models/postModels";
import {postsRepositoryDB} from "../repositories/posts/postsRepositoryDB";
import {blogsService} from "./blogsService";

export const postsService = {
    async getAllPosts(){
        return await postsRepositoryDB.getAllPosts();
    },
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
        return await postsRepositoryDB.createNewPost(newPostTemplate)
    },
    async getPostByID(id: string) {
        return await postsRepositoryDB.getPostByID(id);
    },
    async updatePostByID(id: string, post: requestPostType): Promise<boolean> {
        return await postsRepositoryDB.updatePostByID(id, post);
    },
    async deletePostByID(id: string): Promise<boolean> {
        return await postsRepositoryDB.deletePostByID(id);
    },
    async deleteAllData(): Promise<void> {
        await postsRepositoryDB.deleteAllData();
    }
}