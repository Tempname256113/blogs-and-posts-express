import {CommentInTheDBType, CommentType} from "../models/comment-model";
import {UsersQueryRepository} from "../repositories/users/users-query-repository";
import {UserTypeExtended} from "../models/user-models";
import {CommentsRepository} from "../repositories/comments/comments-repository";

export class CommentsService {
    constructor(
        protected usersQueryRepository: UsersQueryRepository,
        protected commentsRepository: CommentsRepository
    ) {}
    // создает комментарий. нужно передать содержание комментария, id пользователя и id поста к которому был написан комментарий.
    // возвращает комментарий с видом нужным клиенту
    async createComment({content, userId, postId}: {content: string, userId: string, postId: string}): Promise<CommentType>{
        const userFromDB: UserTypeExtended | null = await this.usersQueryRepository.getUserById(userId);
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
        await this.commentsRepository.createComment(commentInTheDBTemplate);
        return commentToClient;
    };
    async deleteCommentByID(commentId: string): Promise<boolean>{
        return this.commentsRepository.deleteCommentByID(commentId);
    };
    async updateComment({content, commentID}: {content: string, commentID: string}){
        const templateForUpdateComment = {
            content,
            commentID
        }
        return this.commentsRepository.updateComment(templateForUpdateComment);
    };
    async deleteAllData(){
        await this.commentsRepository.deleteAllData();
    }
}