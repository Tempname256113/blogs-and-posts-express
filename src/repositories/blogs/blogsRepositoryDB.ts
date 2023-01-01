import {client} from "../../db";
import {blogType, requestBlogType} from "../../models/blogModels";
import {ObjectId} from "mongodb";

const db = client.db('ht02DB').collection('blogs');

export const blogsRepositoryDB = {
    async getAllBlogs() {
        return await db.find({}).project({_id: false}).toArray();
    },
    async createNewBlog(newBlogTemplate: blogType): Promise<blogType> {
        const copyCreatedBlog = {...newBlogTemplate};
        await db.insertOne(newBlogTemplate);
        return copyCreatedBlog;
    },
    async getBlogByID(id: string) {
        const foundedObj = await db.findOne({id: id});
        if (foundedObj) {
            const foundedObjCopy: blogType & {_id?: ObjectId} = {
                _id: foundedObj._id,
                id: foundedObj.id,
                name: foundedObj.name,
                description: foundedObj.description,
                websiteUrl: foundedObj.websiteUrl,
                createdAt: foundedObj.createdAt
            };
            delete foundedObjCopy._id;
            return foundedObjCopy;
        }
        return null;
    },
    // возвращает false если такого объекта в базе данных нет
    // и true если операция прошла успешно
    async updateBlogByID(id: string, blog: requestBlogType): Promise<boolean> {
        const updatedBlog = await db.updateOne(
            {id: id},
            {
                $set:
                    {
                        name: blog.name,
                        description: blog.description,
                        websiteUrl: blog.websiteUrl,
                    }
            }
        )
        return updatedBlog.modifiedCount > 0;
    },
    // возвращает false если такого объекта нет в базе данных
    // и true если успешно прошла операция
    async deleteBlogByID(id: string): Promise<boolean> {
        const deletedBlog = await db.deleteOne({id: id});
        return deletedBlog.deletedCount > 0;
    },
    async findBlogNameByID(id: string): Promise<string | void> {
        const blogByID = await db.findOne({id: id});
        if (blogByID !== null) return blogByID.name;
    },
    async deleteAllData(): Promise<void> {
        await db.deleteMany({});
    }
}