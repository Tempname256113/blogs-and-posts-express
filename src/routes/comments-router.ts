import {Router, Response} from "express";
import {RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../models/req-res-models";
import {CommentType} from "../models/comment-model";
import {CommentsQueryRepository, commentsQueryRepository} from "../repositories/comments/comments-query-repository";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {checkForChangeCommentMiddleware} from "../middlewares/check-for-change-comment-middleware";
import {CommentsService, commentsService} from "../domain/comments-service";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {ErrorObjType} from "../models/errorObj-model";

class CommentsController {
    private commentsQueryRepository: CommentsQueryRepository;
    private commentsService: CommentsService;
    constructor() {
        this.commentsQueryRepository = new CommentsQueryRepository();
        this.commentsService = new CommentsService();
    }
    async getCommentById(req: RequestWithURIParams<{id: string}>, res: ResponseWithBody<CommentType>){
        const foundedCommentById = await this.commentsQueryRepository.getCommentByID(req.params.id);
        foundedCommentById ? res.status(200).send(foundedCommentById) : res.sendStatus(404);
    };
    async deleteCommentById(req: RequestWithURIParams<{commentId: string}>, res: Response){
        const deletedCommentStatus: boolean = await this.commentsService.deleteCommentByID(req.params.commentId);
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
        const updatedCommentStatus: boolean = await this.commentsService.updateComment(dataForUpdateComment);
        updatedCommentStatus ? res.sendStatus(204) : res.sendStatus(404);
    }
}

const commentsControllerInstance = new CommentsController();
export const commentsRouter = Router();

commentsRouter.get('/:id', commentsControllerInstance.getCommentById.bind(commentsControllerInstance));

commentsRouter.delete('/:commentId',
    bearerUserAuthTokenCheckMiddleware,
    checkForChangeCommentMiddleware,
    commentsControllerInstance.deleteCommentById.bind(commentsControllerInstance)
);

commentsRouter.put('/:commentId',
    bearerUserAuthTokenCheckMiddleware,
    checkForChangeCommentMiddleware,
    body('content').isString().trim().isLength({min: 20, max: 300}),
    catchErrorsMiddleware,
    commentsControllerInstance.updateCommentById.bind(commentsControllerInstance)
);