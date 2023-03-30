import {CommentsQueryRepository} from "../repositories/comments/comments-query-repository";
import {CommentsService} from "../domain/comments-service";
import {RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../models/req-res-models";
import {CommentType} from "../models/comment-model";
import {Response} from "express";
import {ErrorObjType} from "../models/errorObj-model";

export class CommentsController {
    constructor(protected commentsQueryRepository: CommentsQueryRepository, protected commentsService: CommentsService) {
    }

    async getCommentById(req: RequestWithURIParams<{ id: string }>, res: ResponseWithBody<CommentType>) {
        const foundedCommentById = await this.commentsQueryRepository.getCommentByID(req.params.id);
        foundedCommentById ? res.status(200).send(foundedCommentById) : res.sendStatus(404);
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