import {client} from "../../db";
import {postType, requestPostType} from "../../models/postModels";
import {ObjectId} from "mongodb";

const db = client.db('ht02DB').collection('posts');

export const postsRepositoryDB = {
    async getAllPosts(){
        return await db.find().project({_id: false}).toArray();
    },
    async createNewPost(newPostTemplate: postType): Promise<postType> {
        const copyCreatedPost = {...newPostTemplate};
        await db.insertOne(newPostTemplate);
        return copyCreatedPost;
    },
    async getPostByID(id: string) {
        const foundedPost = await db.findOne({id: id});
        if (foundedPost) {
            const foundedPostCopy: postType & {_id?: ObjectId} = {
                _id: foundedPost._id,
                id: foundedPost.id,
                title: foundedPost.title,
                shortDescription: foundedPost.shortDescription,
                content: foundedPost.content,
                blogId: foundedPost.blogId,
                blogName: foundedPost.blogName,
                createdAt: foundedPost.createdAt
            };
            delete foundedPostCopy._id;
            return foundedPostCopy;
        }
        return null;
    },
    // возвращает true в случае удачного изменения объекта
    // или false в случае неудачного
    async updatePostByID(id: string, post: requestPostType): Promise<boolean> {
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
    async deletePostByID(id: string): Promise<boolean> {
        const deletedElem = await db.deleteOne({id: id});
        return deletedElem.deletedCount > 0;
    },
    async deleteAllData(): Promise<void> {
        await db.deleteMany({});
    }
}