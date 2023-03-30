import {CommentInTheDBType} from "../../models/comment-model";
import {CommentModel} from "../../mongoose-db-models/comments-db-model";

export class CommentsRepository {
    // создает комментарий в базе данных, нужно передать шаблон для создания комментария.
    // такие шаблоны будут находиться в базе данных.
    // ничего не возвращает
    async createComment(commentInTheDBTemplate: CommentInTheDBType): Promise<void> {
        await new CommentModel(commentInTheDBTemplate).save();
    };
    async deleteCommentByID(commentId: string): Promise<boolean> {
        const deletedCommentStatus = await CommentModel.deleteOne({id: commentId});
        return deletedCommentStatus.deletedCount > 0;
    };
    async updateComment({content, commentID}: {content: string, commentID: string}): Promise<boolean> {
        const updatedCommentStatus = await CommentModel.updateOne({id: commentID}, {content});
        return updatedCommentStatus.matchedCount > 0;
    };
    async deleteAllData(): Promise<void>{
        await CommentModel.deleteMany();
    }
}