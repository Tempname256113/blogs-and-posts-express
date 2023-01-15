import {Router, Response} from "express";
import {RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../models/reqResModels";
import {commentType} from "../models/commentModel";
import {commentsQueryRepository} from "../repositories/comments/commentsQueryRepository";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearerUserAuthTokenCheckMiddleware";
import {checkForChangeCommentMiddleware} from "../middlewares/checkForChangeCommentMiddleware";
import {commentsService} from "../domain/commentsService";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catchErrorsMiddleware";

export const commentsRouter = Router();

commentsRouter.get('/:id',
    async (req: RequestWithURIParams<{id: string}>, res: ResponseWithBody<commentType>) => {
    const foundedComment = await commentsQueryRepository.getCommentByID(req.params.id);
    if (foundedComment) return res.status(200).send(foundedComment);
    res.sendStatus(404);
});

commentsRouter.delete('/:commentId',
    bearerUserAuthTokenCheckMiddleware,
    checkForChangeCommentMiddleware,
    async (req: RequestWithURIParams<{commentId: string}>, res: Response) => {
    const deletedCommentStatus = await commentsService.deleteCommentByID(req.params.commentId);
    if (deletedCommentStatus) return res.sendStatus(204);
    res.sendStatus(404);
});

commentsRouter.put('/:commentId',
    bearerUserAuthTokenCheckMiddleware,
    checkForChangeCommentMiddleware,
    body('content').isString().trim().isLength({min: 20, max: 300}),
    catchErrorsMiddleware,
    async (req: RequestWithURIParamsAndBody<{commentId: string}, {content: string}>, res: Response) => {
    const dataForUpdateComment = {
        content: req.body.content,
        commentID: req.params.commentId
    }
    const updatedCommentStatus = await commentsService.updateComment(dataForUpdateComment);
    if (updatedCommentStatus) return res.sendStatus(204);
    res.sendStatus(404);
});