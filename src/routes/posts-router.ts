import {Response, Router} from "express";
import {
    reqQueryPagination,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody, RequestWithURIParamsAndQuery,
    ResponseWithBody
} from "../models/req-res-models";
import {basicAuthorizationCheckMiddleware} from "../middlewares/basic-authorization-check-middleware";
import {postsService} from "../domain/posts-service";
import {postsValidationMiddlewaresArray} from "../middlewares/middlewares-arrays/posts-validation-middlewares-array";
import {errorObjType} from "../models/errorObj-model";
import {postType, requestPostType} from "../models/post-models";
import {postsQueryRepository} from "../repositories/posts/posts-query-repository";
import {queryPaginationType} from "../models/query-models";
import {commentType} from "../models/comment-model";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {commentsService} from "../domain/comments-service";
import {resultOfPaginationCommentsByQueryType} from "../repositories/mongoDBFeatures/pagination-by-query-params-functions";
import {commentsQueryRepository} from "../repositories/comments/comments-query-repository";

export const postsRouter = Router();

postsRouter.get('/', async (req: RequestWithQuery<reqQueryPagination>, res: Response) => {
    const paginationConfig: queryPaginationType = {
        sortBy: req.query.sortBy ?? 'createdAt',
        sortDirection: req.query.sortDirection ?? 'desc',
        pageNumber: req.query.pageNumber ?? 1,
        pageSize: req.query.pageSize ?? 10
    }
    const receivedPost = await postsQueryRepository.getPostsWithSortAndPagination(paginationConfig);
    res.status(200).send(receivedPost);
});

postsRouter.get('/:id', async (req: RequestWithURIParams<{ id: string }>, res: Response) => {
    const getPost: postType | null = await postsQueryRepository.getPostByID(req.params.id);
    if (getPost) return res.status(200).send(getPost);
    res.sendStatus(404);
});

postsRouter.get('/:id/comments',
    async (req: RequestWithURIParamsAndQuery<{ id: string }, queryPaginationType>, res: ResponseWithBody<resultOfPaginationCommentsByQueryType>) => {
        const foundedPost: postType | null = await postsQueryRepository.getPostByID(req.params.id);
        if (!foundedPost) return res.sendStatus(404);
        const paginationQueryConfig: { postId: string } & queryPaginationType = {
            postId: req.params.id,
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10
        }
        const commentsWithPagination = await commentsQueryRepository.getCommentsWithPagination(paginationQueryConfig);
        res.status(200).send(commentsWithPagination);
});

postsRouter.post('/',
    basicAuthorizationCheckMiddleware,
    postsValidationMiddlewaresArray,
    async (req: RequestWithBody<requestPostType>, res: ResponseWithBody<errorObjType | postType>) => {
        const createdPost: postType = await postsService.createNewPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        });
    res.status(201).send(createdPost);
});

postsRouter.post('/:id/comments',
    bearerUserAuthTokenCheckMiddleware,
    body('content').isString().trim().isLength({min: 20, max: 300}),
    catchErrorsMiddleware,
    async (req: RequestWithURIParamsAndBody<{ id: string }, { content: string }>, res: ResponseWithBody<commentType>) => {
        const foundedPost: postType | null = await postsQueryRepository.getPostByID(req.params.id);
        if (!foundedPost) return res.sendStatus(404);
        const dataForCreateNewComment = {
            content: req.body.content,
            userId: req.context.accessTokenPayload!.userId,
            postId: req.params.id
        }
        const newCreatedComment = await commentsService.createComment(dataForCreateNewComment);
        res.status(201).send(newCreatedComment);
    });

postsRouter.put('/:id',
    basicAuthorizationCheckMiddleware,
    postsValidationMiddlewaresArray,
    async (req: RequestWithURIParamsAndBody<{ id: string }, requestPostType>, res: Response) => {
        const updatePostStatus = await postsService.updatePostByID(req.params.id, req.body);
        if (updatePostStatus) return res.sendStatus(204);
        res.sendStatus(404);
    });

postsRouter.delete('/:id',
    basicAuthorizationCheckMiddleware,
    async (req: RequestWithURIParams<{ id: string }>, res: Response) => {
        const deletePostStatus = await postsService.deletePostByID(req.params.id);
        if (deletePostStatus) return res.sendStatus(204);
        res.sendStatus(404);
    });