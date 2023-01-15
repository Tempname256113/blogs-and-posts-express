import {commentInTheDBType} from "../../models/commentModel";
import {client} from "../../db";

const commentsCollection = client.db('ht02DB').collection('comments');

export const commentsRepository = {
    // создает комментарий в базе данных, нужно передать шаблон для создания комментария.
    // такие шаблоны будут находиться в базе данных.
    // ничего не возвращает
    async createComment(commentInTheDBTemplate: commentInTheDBType): Promise<void>{
        await commentsCollection.insertOne(commentInTheDBTemplate);
    },
    async deleteCommentByID(commentId: string): Promise<boolean>{
        const deletedCommentStatus = await commentsCollection.deleteOne({id: commentId});
        return deletedCommentStatus.deletedCount > 0;
    },
    async updateComment({content, commentID}: {content: string, commentID: string}): Promise<boolean>{
        const foundedComment = await commentsCollection.findOne({id: commentID});
        if (foundedComment) {
            await commentsCollection.updateOne(
                {id: commentID},
                {$set: {content}}
            );
            return true;
        }
        return false;
    },
    async deleteAllData(): Promise<void>{
        await commentsCollection.deleteMany({});
    }
}
