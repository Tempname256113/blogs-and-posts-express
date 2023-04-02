import {Router} from "express";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {checkForChangeCommentMiddleware} from "../middlewares/check-for-change-comment-middleware";
import {body, validationResult} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {commentsController} from "../composition-root";

export const commentsRouter = Router();

commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsController));

commentsRouter.delete('/:commentId',
    bearerUserAuthTokenCheckMiddleware,
    checkForChangeCommentMiddleware,
    commentsController.deleteCommentById.bind(commentsController)
);

commentsRouter.put('/:commentId',
    bearerUserAuthTokenCheckMiddleware,
    checkForChangeCommentMiddleware,
    body('content').isString().trim().isLength({min: 20, max: 300}),
    catchErrorsMiddleware,
    commentsController.updateCommentById.bind(commentsController)
);

commentsRouter.put('/:commentId/like-status',
    bearerUserAuthTokenCheckMiddleware,
    body('likeStatus').isString().trim().isIn(['None', 'Like', 'Dislike']),
    catchErrorsMiddleware,
    commentsController.changeLikeStatus.bind(commentsController)
)