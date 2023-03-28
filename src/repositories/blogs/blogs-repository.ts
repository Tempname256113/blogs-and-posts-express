import {BlogType, RequestBlogType} from "../../models/blog-models";
import {BlogModel} from "../../mongoose-db-models/blogs-db-model";

class BlogsRepository {
    async createNewBlog(newBlogTemplate: BlogType): Promise<BlogType> {
        await new BlogModel(newBlogTemplate).save();
        return newBlogTemplate;
    };
    async updateBlogByID(id: string, {name, description, websiteUrl}: RequestBlogType): Promise<void> {
        await BlogModel.updateOne(
            {id},
            {
                name,
                description,
                websiteUrl
            })
    };
    // возвращает false если такого объекта нет в базе данных
    // и true если успешно прошла операция
    async deleteBlogByID(id: string): Promise<boolean> {
        const deletedBlog = await BlogModel.deleteOne({id: id});
        return deletedBlog.deletedCount > 0;
    };
    async deleteAllData(): Promise<void> {
        await BlogModel.deleteMany();
    }
}

export const blogsRepository = new BlogsRepository();