import {client} from "../db";
import {IBlog, IRequestBlogModel} from "../models/blogModels";

const db = client.db('ht02DB').collection('blogs');

export const blogsRepositoryDB = {
    async getAllBlogs() {
        return await db.find({}).project({_id: false}).toArray();
    },
    async createNewBlog(newBlog: IRequestBlogModel): Promise<IBlog> {
        const createdBlog: IBlog = {
            id: 'id' + (new Date()).getTime(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: new Date().toISOString()
        };
        await db.insertOne(createdBlog);
        const createdBlogWithout_id = {...createdBlog} as any;
        delete createdBlogWithout_id._id;
        return createdBlogWithout_id;
    },
    async getBlogByID(id: string) {
        const foundedObj = await db.findOne(
            {id: id}
        );
        if (foundedObj) {
            return {
                id: foundedObj.id,
                name: foundedObj.name,
                description: foundedObj.description,
                websiteUrl: foundedObj.websiteUrl,
                createdAt: foundedObj.createdAt
            } as IBlog
        }
        return null;
    },
    // возвращает false если такого объекта в базе данных нет
    // и true если операция прошла успешно
    async updateBlogByID(id: string, blog: IRequestBlogModel): Promise<false | true | 'nothing'> {
        const findElemByID = await db.findOne(
            {id: id}
        );
        if (findElemByID === null) {
            return false;
        }
        await db.updateOne(
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
        return true;
    },
    // возвращает false если такого объекта нет в базе данных
    // и true если успешно прошла операция
    async deleteBlogByID(id: string): Promise<false | true | 'nothing'> {
        const findElemByID = await db.findOne({id: id});
        if (findElemByID === null) {
            return false;
        }
        await db.deleteOne({id: id});
        return true;
    },
    async findBlogNameByID(id: string) {
        const blogByID = await db.findOne({id: id});
        if (blogByID !== null) return blogByID.name;
        return null;
    },
    async deleteAllData(): Promise<void | 'nothing'> {
        await db.deleteMany({});
    }
}