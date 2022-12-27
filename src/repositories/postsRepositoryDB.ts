import {client} from "../db";
import {blogsRepositoryDB} from "./blogsRepositoryDB";
import {IPost, IRequestPostModel} from "../models/postModels";

const db = client.db('ht02DB').collection('posts');

export const postsRepositoryDB = {
    async getAllPosts(){
        return await db.find().project({_id: false}).toArray();
    },
    async createNewPost(newPost: IRequestPostModel): Promise<IPost> {
        const createdPost: IPost = {
            id: 'id' + (new Date()).getTime(),
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: await blogsRepositoryDB.findBlogNameByID(newPost.blogId),
            createdAt: new Date().toISOString()
        }
        await db.insertOne(createdPost);
        const createdPostWithout_id = {...createdPost} as any;
        delete createdPostWithout_id._id;
        return createdPostWithout_id;
    },
    async getPostByID(id: string) {
        const foundedPost = await db.findOne({id: id});
        if (foundedPost !== null) {
            const foundedPostCopyWithout_id = {...foundedPost} as any;
            delete foundedPostCopyWithout_id._id
            return foundedPostCopyWithout_id;
        }
        return null;
    },
    // возвращает true в случае удачного изменения объекта
    // или false в случае неудачного
    async updatePostByID(id: string, post: IRequestPostModel): Promise<false| true> {
        if (await db.findOne({id: id}) === null) {
            return false;
        }
        await db.updateOne(
            {id: id},
            {$set: {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogId,
                }
            }
        )
        return true;
    },
    // если нашел и удалил элемент - возвращает true. если элемента нет - false
    async deletePostByID(id: string) {
        const deletedElem = await db.deleteOne({id: id});
        return deletedElem.deletedCount > 0;
    },
    async deleteAllData(): Promise<void> {
        await db.deleteMany({});
    }
}