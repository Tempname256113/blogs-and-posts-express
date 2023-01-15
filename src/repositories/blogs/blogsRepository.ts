import {client} from "../../db";
import {blogType, requestBlogType} from "../../models/blogModels";

const blogsCollection = client.db('ht02DB').collection('blogs');

export const blogsRepository = {
    async createNewBlog(newBlogTemplate: blogType): Promise<blogType> {
        const copyCreatedBlog = {...newBlogTemplate};
        await blogsCollection.insertOne(newBlogTemplate);
        return copyCreatedBlog;
    },
    // возвращает false если такого объекта в базе данных нет
    // и true если операция прошла успешно
    async updateBlogByID(id: string, {name, description, websiteUrl}: requestBlogType): Promise<boolean> {
        const foundedBlog = await blogsCollection.findOne({id});
        if (foundedBlog) {
            const templateForUpdateBlog: requestBlogType = {
                name,
                description,
                websiteUrl
            }
            await blogsCollection.updateOne(
                {id},
                {$set: templateForUpdateBlog}
            )
            return true;
        }
        return false;
    },
    // возвращает false если такого объекта нет в базе данных
    // и true если успешно прошла операция
    async deleteBlogByID(id: string): Promise<boolean> {
        const deletedBlog = await blogsCollection.deleteOne({id: id});
        return deletedBlog.deletedCount > 0;
    },
    async findBlogNameByID(id: string): Promise<string | void> {
        const blogByID = await blogsCollection.findOne({id: id});
        if (blogByID !== null) return blogByID.name;
    },
    async deleteAllData(): Promise<void> {
        await blogsCollection.deleteMany({});
    }
}