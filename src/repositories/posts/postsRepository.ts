import {client} from "../../db";
import {postType, requestPostType} from "../../models/postModels";

const postsCollection = client.db('ht02DB').collection('posts');

export const postsRepository = {
    async createNewPost(newPostTemplate: postType): Promise<postType> {
        const copyCreatedPost = {...newPostTemplate};
        await postsCollection.insertOne(newPostTemplate);
        return copyCreatedPost;
    },
    // возвращает true в случае удачного изменения объекта
    // или false в случае неудачного
    async updatePostByID(id: string, {title, shortDescription, content, blogId}: requestPostType): Promise<boolean> {
        const foundedPost = await postsCollection.findOne({id});
        if (foundedPost) {
            const templateForUpdatePost = {
                title,
                shortDescription,
                content,
                blogId
            }
            await postsCollection.updateOne(
                {id},
                {$set: templateForUpdatePost}
            )
            return true;
        }
        return false;
    },
    // если нашел и удалил элемент - возвращает true. если элемента нет - false
    async deletePostByID(id: string): Promise<boolean> {
        const deletedElem = await postsCollection.deleteOne({id: id});
        return deletedElem.deletedCount > 0;
    },
    async deleteAllData(): Promise<void> {
        await postsCollection.deleteMany({});
    }
}