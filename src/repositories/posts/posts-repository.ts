import {PostInTheDBType, RequestPostType} from "../../models/post-models";
import {PostModel} from "../../mongoose-db-models/post-db-model";
import {injectable} from "inversify";
import {CommentsLikesModel} from "../../mongoose-db-models/comment-likes-db-model";
import {PostLikesModel} from "../../mongoose-db-models/post-likes-db-model";
import {PostLikeModelType} from "../../models/post-likes-models";

@injectable()
export class PostsRepository {
    async createNewPost(newPostTemplate: PostInTheDBType): Promise<void> {
        await new PostModel(newPostTemplate).save();
    };
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
    };
    // если нашел и удалил элемент - возвращает true. если элемента нет - false
    async deletePostByID(id: string): Promise<boolean> {
        const deletedElem = await PostModel.deleteOne({id});
        return deletedElem.deletedCount > 0;
    };
    async deleteAllData(): Promise<void> {
        await PostModel.deleteMany();
    };
    async deleteLikeStatus(userId: string, postId: string): Promise<boolean>{
        const filter = {$and: [{userId}, {postId}]};
        const deleteStatus = await PostLikesModel.deleteOne(filter);
        return deleteStatus.deletedCount > 0;
    };
    async addLikeStatus(likeData: PostLikeModelType): Promise<void>{
        await new PostLikesModel({
            postId: likeData.postId,
            userId: likeData.userId,
            userLogin: likeData.userLogin,
            addedAt: likeData.addedAt,
            likeStatus: likeData.likeStatus
        }).save()
    };
    async updateLikeStatus(updateData: {userId: string, postId: string, likeStatus: 'Like' | 'Dislike'}): Promise<void>{
        const filter = {$and: [{userId: updateData.userId}, {postId: updateData.postId}]};
        await PostLikesModel.updateOne(filter, {likeStatus: updateData.likeStatus});
    };
    async deleteAllPostsLikes(): Promise<void>{
        await PostLikesModel.deleteMany();
    };
}