import {PostType, RequestPostType} from "../../models/post-models";
import {PostModel} from "../../mongoose-db-models/posts-db-model";

export const postsRepository = {
    async createNewPost(newPostTemplate: PostType): Promise<PostType> {
        await new PostModel(newPostTemplate).save();
        return newPostTemplate;
    },
    // возвращает true в случае удачного изменения объекта
    // или false в случае неудачного
    async updatePostByID(id: string,
                         {
                             title,
                             shortDescription,
                             content,
                             blogId
                         }: RequestPostType): Promise<boolean> {
        const updatedPostStatus = await PostModel.updateOne(
            {id},
            {
                title,
                shortDescription,
                content,
                blogId
            }
        );
        return updatedPostStatus.matchedCount > 0;
    },
    // если нашел и удалил элемент - возвращает true. если элемента нет - false
    async deletePostByID(id: string): Promise<boolean> {
        const deletedElem = await PostModel.deleteOne({id});
        return deletedElem.deletedCount > 0;
    },
    async deleteAllData(): Promise<void> {
        await PostModel.deleteMany();
    }
}