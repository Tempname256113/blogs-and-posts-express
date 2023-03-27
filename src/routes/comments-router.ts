import {Router, Response} from "express";
import {RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../models/req-res-models";
import {CommentType} from "../models/comment-model";
import {commentsQueryRepository} from "../repositories/comments/comments-query-repository";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {checkForChangeCommentMiddleware} from "../middlewares/check-for-change-comment-middleware";
import {commentsService} from "../domain/comments-service";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {ErrorObjType} from "../models/errorObj-model";

class CommentsController {
    async getCommentById(req: RequestWithURIParams<{id: string}>, res: ResponseWithBody<CommentType>){
        const foundedCommentById = await commentsQueryRepository.getCommentByID(req.params.id);
        foundedCommentById ? res.status(200).send(foundedCommentById) : res.sendStatus(404);
    };
    async deleteCommentById(req: RequestWithURIParams<{commentId: string}>, res: Response){
        const deletedCommentStatus: boolean = await commentsService.deleteCommentByID(req.params.commentId);
        deletedCommentStatus ? res.sendStatus(204) : res.sendStatus(404);
    };
    async updateCommentById(
        req: RequestWithURIParamsAndBody<{commentId: string}, {content: string}>,
        res: Response<ErrorObjType>
    ){
        const dataForUpdateComment = {
            content: req.body.content,
            commentID: req.params.commentId
        }
        const updatedCommentStatus: boolean = await commentsService.updateComment(dataForUpdateComment);
        updatedCommentStatus ? res.sendStatus(204) : res.sendStatus(404);
    }
}

const commentsControllerInstance = new CommentsController();
export const commentsRouter = Router();

commentsRouter.get('/:id', commentsControllerInstance.getCommentById);

commentsRouter.delete('/:commentId',
    bearerUserAuthTokenCheckMiddleware,
    checkForChangeCommentMiddleware,
    commentsControllerInstance.deleteCommentById
);

commentsRouter.put('/:commentId',
    bearerUserAuthTokenCheckMiddleware,
    checkForChangeCommentMiddleware,
    body('content').isString().trim().isLength({min: 20, max: 300}),
    catchErrorsMiddleware,
    commentsControllerInstance.updateCommentById
);