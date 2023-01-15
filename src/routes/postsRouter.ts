import {Response, Router} from "express";
import {
    reqQueryPagination,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody, RequestWithURIParamsAndQuery,
    ResponseWithBody
} from "../models/reqResModels";
import {authorizationCheckMiddleware} from "../middlewares/authorizationCheckMiddleware";
import {postsService} from "../domain/postsService";
import {postsValidationMiddlewaresArray} from "../middlewares/middlewaresArray/postsValidationMiddlewaresArray";
import {errorObjType} from "../models/errorObjModel";
import {postType, requestPostType} from "../models/postModels";
import {postsQueryRepository} from "../repositories/posts/postsQueryRepository";
import {queryPaginationType} from "../models/queryModels";
import {commentType} from "../models/commentModel";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catchErrorsMiddleware";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearerUserAuthTokenCheckMiddleware";
import {commentsService} from "../domain/commentsService";
import {resultOfPaginationCommentsByQueryType} from "../repositories/mongoDBFeatures/paginationByQueryParamsFunctions";
import {commentsQueryRepository} from "../repositories/comments/commentsQueryRepository";

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

postsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getPost = await postsQueryRepository.getPostByID(req.params.id);
    if (getPost) return res.status(200).send(getPost);
    res.sendStatus(404);
});

postsRouter.get('/:id/comments',
    async (req: RequestWithURIParamsAndQuery<{id: string}, queryPaginationType>, res: ResponseWithBody<resultOfPaginationCommentsByQueryType>) => {
    const foundedPost: postType | null = await postsQueryRepository.getPostByID(req.params.id);
    if (!foundedPost) return res.sendStatus(404);
    const paginationQueryConfig: {postId: string} & queryPaginationType = {
        postId: req.params.id,
        sortBy: req.query.sortBy ?? 'createdAt',
        sortDirection: req.query.sortDirection ?? 'desc',
        pageNumber: req.query.pageNumber ?? 1,
        pageSize: req.query.pageSize ?? 10
    }
    const commentsWithPagination = await commentsQueryRepository.getCommentsWithPagination(paginationQueryConfig);
    res.status(200).send(commentsWithPagination);
})

postsRouter.post('/',
    postsValidationMiddlewaresArray,
    async (req: RequestWithBody<requestPostType>, res: ResponseWithBody<errorObjType | postType>) => {
    const createdPost: postType = await postsService.createNewPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        })
    res.status(201).send(createdPost);
});

postsRouter.post('/:id/comments',
    bearerUserAuthTokenCheckMiddleware,
    body('content').isString().trim().isLength({min: 20, max: 300}),
    catchErrorsMiddleware,
    async (req: RequestWithURIParamsAndBody<{id: string}, {content: string}>, res: ResponseWithBody<commentType>) => {
    const foundedPost: postType | null = await postsQueryRepository.getPostByID(req.params.id);
    if (!foundedPost) return res.sendStatus(404);
    const dataForCreateNewComment = {
        content: req.body.content,
        userId: req.context!.JWT_PAYLOAD!.userId,
        postId: req.params.id
    }
    const newCreatedComment = await commentsService.createComment(dataForCreateNewComment);
    res.status(201).send(newCreatedComment);
});

postsRouter.put('/:id',
    postsValidationMiddlewaresArray,
    async (req: RequestWithURIParamsAndBody<{id: string}, requestPostType>, res: Response) => {
    const updatePostStatus = await postsService.updatePostByID(req.params.id, req.body);
    if (updatePostStatus) return res.sendStatus(204);
    res.sendStatus(404);
});

postsRouter.delete('/:id',
    authorizationCheckMiddleware,
    async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const deletePostStatus = await postsService.deletePostByID(req.params.id);
    if (deletePostStatus) return res.sendStatus(204);
    res.sendStatus(404);
});