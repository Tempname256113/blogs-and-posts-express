import {CommentInTheDBType, CommentType} from "../models/comment-models";
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
            commentatorInfo: {
                userId,
                userLogin
            },
            createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            }
        }
        const commentInTheDBTemplate: CommentInTheDBType = {
            postId,
            commentId: myUniqueId,
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
    };
    async changeLikeStatus(changeLikeStatusData: {likeStatus: 'None' | 'Like' | 'Dislike', userId: string, commentId: string}): Promise<void>{
        await this.commentsRepository.deleteLikeStatusByUserId(changeLikeStatusData.userId);
        if (changeLikeStatusData.likeStatus !== 'None') await this.commentsRepository.addLikeStatus({
            commentId: changeLikeStatusData.commentId,
            userId: changeLikeStatusData.userId,
            likeStatus: changeLikeStatusData.likeStatus
        })
    }
}