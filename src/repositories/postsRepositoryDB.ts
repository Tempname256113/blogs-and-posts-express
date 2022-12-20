import {IRequestPostModel, IPost} from "../models/models";
import {client} from "../db";
import {blogsRepositoryDB} from "./blogsRepositoryDB";

const db = client.db('ht02DB').collection('posts');

export const postsRepositoryDB = {
    async getAllPosts(){
        return db.find().toArray();
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
        return createdPost;
    },
    async getPostByID(id: string) {
        return db.findOne({id: id});
    },
    // возвращает true в случае удачного изменения объекта
    // или false в случае неудачного
    async updatePostByID(id: string, post: IRequestPostModel): Promise<false| true> {
        if (await db.find({id: id}) === null) {
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