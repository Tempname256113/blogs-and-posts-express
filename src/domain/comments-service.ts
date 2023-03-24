import {CommentInTheDBType, CommentType} from "../models/comment-model";
import {usersQueryRepository} from "../repositories/users/users-query-repository";
import {UserTypeExtended} from "../models/user-models";
import {commentsRepository} from "../repositories/comments/comments-repository";

export const commentsService = {
    // создает комментарий. нужно передать содержание комментария, id пользователя и id поста к которому был написан комментарий.
    // возвращает комментарий с видом нужным клиенту
    async createComment({content, userId, postId}: {content: string, userId: string, postId: string}): Promise<CommentType>{
        const userFromDB: UserTypeExtended | null = await usersQueryRepository.getUserById(userId);
        const userLogin: string = userFromDB!.accountData.login;
        const createdAt = new Date().toISOString();
        const myUniqueId = 'id' + new Date().getTime();
        const commentToClient: CommentType = {
            id: myUniqueId,
            content,
            userId,
            userLogin,
            createdAt
        }
        const commentInTheDBTemplate: CommentInTheDBType = {
            postId,
            id: myUniqueId,
            content,
            userId,
            userLogin,
            createdAt
        }
        await commentsRepository.createComment(commentInTheDBTemplate);
        return commentToClient;
    },
    async deleteCommentByID(commentId: string): Promise<boolean>{
        return commentsRepository.deleteCommentByID(commentId);
    },
    async updateComment({content, commentID}: {content: string, commentID: string}){
        const templateForUpdateComment = {
            content,
            commentID
        }
        return commentsRepository.updateComment(templateForUpdateComment);
    },
    async deleteAllData(){
        await commentsRepository.deleteAllData();
    }
}