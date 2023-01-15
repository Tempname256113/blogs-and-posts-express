import {commentInTheDBType, commentType} from "../models/commentModel";
import {usersQueryRepository} from "../repositories/users/usersQueryRepository";
import {userType} from "../models/userModels";
import {commentsRepository} from "../repositories/comments/commentsRepository";

export const commentsService = {
    // создает комментарий. нужно передать содержание комментария, id пользователя и id поста к которому был написан комментарий.
    // возвращает комментарий с видом нужным клиенту
    async createComment({content, userId, postId}: {content: string, userId: string, postId: string}): Promise<commentType>{
        const userFromDB: userType | null = await usersQueryRepository.getUserById(userId);
        const userLogin: string = userFromDB!.login;
        const createdAt = new Date().toISOString();
        const myUniqueId = 'id' + new Date().getTime();
        const commentToClient: commentType = {
            id: myUniqueId,
            content,
            userId,
            userLogin,
            createdAt
        }
        const commentInTheDBTemplate: commentInTheDBType = {
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