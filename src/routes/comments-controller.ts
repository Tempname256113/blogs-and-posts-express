import {CommentsQueryRepository} from "../repositories/comments/comments-query-repository";
import {CommentsService} from "../domain/comments-service";
import {RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../models/req-res-models";
import {CommentDocumentMongooseType, CommentType} from "../models/comment-models";
import {Response} from "express";
import {ErrorObjType} from "../models/errorObj-model";
import {jwtMethods} from "./application/jwt-methods";
import {AccessTokenPayloadType} from "../models/token-models";
import {LikesInfoType} from "../models/comment-likes-model";

export class CommentsController {
    constructor(protected commentsQueryRepository: CommentsQueryRepository, protected commentsService: CommentsService) {
    }

    async getCommentById(req: RequestWithURIParams<{ id: string }>, res: ResponseWithBody<CommentType>) {
        const getUserId = (): string | null => {
            const accessToken: string | undefined = req.headers.authorization;
            if (!accessToken) return null;
            const accessTokenPayload: AccessTokenPayloadType | null = jwtMethods.compareToken.accessToken(accessToken);
            if (!accessTokenPayload) return null;
            return accessTokenPayload.userId;
        };
        const userId: string | null = getUserId();
        const foundedCommentById: CommentDocumentMongooseType | null = await this.commentsQueryRepository.getCommentByID(req.params.id);
        if (!foundedCommentById) return res.sendStatus(404);
        const commentLikesInfo: LikesInfoType = await foundedCommentById.getLikesInfo(userId);
        const commentToClient: CommentType = {
            commentId: foundedCommentById.commentId,
            content: foundedCommentById.content,
            commentatorInfo: {
                userId: foundedCommentById.userId,
                userLogin: foundedCommentById.userLogin
            },
            createdAt: foundedCommentById.createdAt,
            likesInfo: {
                likesCount: commentLikesInfo.likesCount,
                dislikesCount: commentLikesInfo.dislikesCount,
                myStatus: commentLikesInfo.myLikeStatus
            }
        }
        res.status(200).send(commentToClient);
    };

    async deleteCommentById(req: RequestWithURIParams<{ commentId: string }>, res: Response) {
        const deletedCommentStatus: boolean = await this.commentsService.deleteCommentByID(req.params.commentId);
        deletedCommentStatus ? res.sendStatus(204) : res.sendStatus(404);
    };

    async updateCommentById(
        req: RequestWithURIParamsAndBody<{ commentId: string }, { content: string }>,
        res: Response<ErrorObjType>
    ) {
        const dataForUpdateComment = {
            content: req.body.content,
            commentID: req.params.commentId
        }
        const updatedCommentStatus: boolean = await this.commentsService.updateComment(dataForUpdateComment);
        updatedCommentStatus ? res.sendStatus(204) : res.sendStatus(404);
    }
}