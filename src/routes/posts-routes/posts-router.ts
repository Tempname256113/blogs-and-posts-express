import {Router} from "express";
import {basicAuthorizationCheckMiddleware} from "../../middlewares/basic-authorization-check-middleware";
import {postsValidationMiddlewaresArray} from "../../middlewares/middlewares-arrays/posts-validation-middlewares-array";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../../middlewares/catch-errors-middleware";
import {bearerUserAuthTokenCheckMiddleware} from "../../middlewares/bearer-user-auth-token-check-middleware";
import {container} from "../../composition-root";
import {PostsController} from "./posts-controller";

// const postsController = iocContainer.getInstance<PostsController>(PostsController);
const postsController = container.resolve(PostsController);

export const postsRouter = Router();

postsRouter.get('/', postsController.getAllPostsWithSortAndPagination.bind(postsController));

postsRouter.get('/:id', postsController.getPostById.bind(postsController));

postsRouter.get('/:id/comments',postsController.getAllCommentsByPostId.bind(postsController));

postsRouter.post('/',
    basicAuthorizationCheckMiddleware,
    postsValidationMiddlewaresArray,
    postsController.createNewPost.bind(postsController)
);

postsRouter.post('/:id/comments',
    bearerUserAuthTokenCheckMiddleware,
    body('content').isString().trim().isLength({min: 20, max: 300}),
    catchErrorsMiddleware,
    postsController.createNewCommentByPostId.bind(postsController)
);

postsRouter.put('/:id',
    basicAuthorizationCheckMiddleware,
    postsValidationMiddlewaresArray,
    postsController.updatePostById.bind(postsController)
);

postsRouter.delete('/:id',
    basicAuthorizationCheckMiddleware,
    postsController.deletePostById.bind(postsController)
);

postsRouter.put('/:postId/like-status',
    bearerUserAuthTokenCheckMiddleware,
    body('likeStatus').isString().trim().isIn(['None', 'Like', 'Dislike']),
    catchErrorsMiddleware,
    postsController.changeLikeStatus.bind(postsController)
);