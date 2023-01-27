import {client} from "../../db";
import {blogType, requestBlogType} from "../../models/blogModels";

const blogsCollection = client.db('ht02DB').collection('blogs');

export const blogsRepository = {
    async createNewBlog(newBlogTemplate: blogType): Promise<blogType> {
        await blogsCollection.insertOne({...newBlogTemplate});
        return newBlogTemplate;
    },
    async updateBlogByID(id: string, {name, description, websiteUrl}: requestBlogType): Promise<void> {
        await blogsCollection.updateOne(
            {id},
            {
                $set: {
                    name,
                    description,
                    websiteUrl
                }
            }
        )
    },
    // возвращает false если такого объекта нет в базе данных
    // и true если успешно прошла операция
    async deleteBlogByID(id: string): Promise<boolean> {
        const deletedBlog = await blogsCollection.deleteOne({id: id});
        return deletedBlog.deletedCount > 0;
    },
    async deleteAllData(): Promise<void> {
        await blogsCollection.deleteMany({});
    }
}