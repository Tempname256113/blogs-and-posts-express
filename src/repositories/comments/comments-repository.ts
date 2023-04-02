import {CommentInTheDBType} from "../../models/comment-models";
import {CommentModel} from "../../mongoose-db-models/comments-db-model";
import {CommentsLikesModel} from "../../mongoose-db-models/likes-db-model";
import {CommentLikesModel} from "../../models/comment-likes-model";

export class CommentsRepository {
    // создает комментарий в базе данных, нужно передать шаблон для создания комментария.
    // такие шаблоны будут находиться в базе данных.
    // ничего не возвращает
    async createComment(commentInTheDBTemplate: CommentInTheDBType): Promise<void> {
        await new CommentModel(commentInTheDBTemplate).save();
    };
    async deleteCommentByID(commentId: string): Promise<boolean> {
        const deletedCommentStatus = await CommentModel.deleteOne({commentId: commentId});
        return deletedCommentStatus.deletedCount > 0;
    };
    async updateComment({content, commentID}: {content: string, commentID: string}): Promise<boolean> {
        const updatedCommentStatus = await CommentModel.updateOne({commentId: commentID}, {content});
        return updatedCommentStatus.matchedCount > 0;
    };
    async deleteAllData(): Promise<void>{
        await CommentModel.deleteMany();
    };
    async deleteLikeStatusByUserId(userId: string): Promise<boolean>{
        const deleteStatus = await CommentsLikesModel.deleteOne();
        return deleteStatus.deletedCount > 0;
    };
    async addLikeStatus(likeData: CommentLikesModel): Promise<void>{
        await new CommentsLikesModel({
            userId: likeData.userId,
            commentId: likeData.commentId,
            likeStatus: likeData.likeStatus
        }).save()
    };
    async deleteAllCommentsLikes(): Promise<void>{
        await CommentsLikesModel.deleteMany();
    }
}