import {client} from "../../db";
import {postType, requestPostType} from "../../models/post-models";

const postsCollection = client.db('ht02DB').collection('posts');

export const postsRepository = {
    async createNewPost(newPostTemplate: postType): Promise<postType> {
        const copyCreatedPost = {...newPostTemplate};
        await postsCollection.insertOne(newPostTemplate);
        return copyCreatedPost;
    },
    // возвращает true в случае удачного изменения объекта
    // или false в случае неудачного
    async updatePostByID(id: string, {title, shortDescription, content, blogId}: requestPostType): Promise<void> {
        await postsCollection.updateOne(
            {id},
            {
                $set: {
                    title,
                    shortDescription,
                    content,
                    blogId
                }
            }
        )
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