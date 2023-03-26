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
import {ErrorObjType} from "../models/errorObj-model";
import {PostType, RequestPostType} from "../models/post-models";
import {postsQueryRepository} from "../repositories/posts/posts-query-repository";
import {queryPaginationType} from "../models/query-models";
import {CommentType} from "../models/comment-model";
import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {commentsService} from "../domain/comments-service";
import {
    ResultOfPaginationCommentsByQueryType,
    ResultOfPaginationPostsByQueryType
} from "../repositories/mongo-DB-features/pagination-by-query-params-functions";
import {commentsQueryRepository} from "../repositories/comments/comments-query-repository";

class PostsController {
    async getAllPostsWithSortAndPagination(req: RequestWithQuery<reqQueryPagination>, res: Response){
        const paginationConfig: queryPaginationType = {
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10
        }
        const receivedPost: ResultOfPaginationPostsByQueryType = await postsQueryRepository.getPostsWithSortAndPagination(paginationConfig);
        res.status(200).send(receivedPost);
    };
    async getPostById(req: RequestWithURIParams<{ id: string }>, res: Response){
        const getPost: PostType | null = await postsQueryRepository.getPostByID(req.params.id);
        getPost ? res.status(200).send(getPost) : res.sendStatus(404);
    };
    async getAllCommentsByPostId(
        req: RequestWithURIParamsAndQuery<{ id: string }, queryPaginationType>,
        res: ResponseWithBody<ResultOfPaginationCommentsByQueryType>
    ){
        const foundedPostById: PostType | null = await postsQueryRepository.getPostByID(req.params.id);
        if (!foundedPostById) return res.sendStatus(404);
        const paginationQueryConfig: { postId: string } & queryPaginationType = {
            postId: req.params.id,
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10
        }
        const commentsWithPagination: ResultOfPaginationCommentsByQueryType = await commentsQueryRepository.getCommentsWithPagination(paginationQueryConfig);
        res.status(200).send(commentsWithPagination);
    };
    async createNewPost(req: RequestWithBody<RequestPostType>, res: ResponseWithBody<ErrorObjType | PostType>){
        const createdPost: PostType = await postsService.createNewPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        });
        res.status(201).send(createdPost);
    };
    async createNewCommentByPostId(
        req: RequestWithURIParamsAndBody<{ id: string }, { content: string }>,
        res: ResponseWithBody<CommentType | ErrorObjType>
    ){
        const foundedPost: PostType | null = await postsQueryRepository.getPostByID(req.params.id);
        if (!foundedPost) return res.sendStatus(404);
        const dataForCreateNewComment = {
            content: req.body.content,
            userId: req.context.accessTokenPayload!.userId,
            postId: req.params.id
        }
        const newCreatedComment: CommentType = await commentsService.createComment(dataForCreateNewComment);
        res.status(201).send(newCreatedComment);
    };
    async updatePostById(req: RequestWithURIParamsAndBody<{ id: string }, RequestPostType>, res: Response){
        const updatePostStatus: boolean = await postsService.updatePostByID(req.params.id, req.body);
        updatePostStatus ? res.sendStatus(204) : res.sendStatus(404);
    };
    async deletePostById(req: RequestWithURIParams<{ id: string }>, res: Response){
        const deletePostStatus: boolean = await postsService.deletePostByID(req.params.id);
        deletePostStatus ? res.sendStatus(204) : res.sendStatus(404);
    }
}

const postsControllerInstance = new PostsController();
export const postsRouter = Router();

postsRouter.get('/', postsControllerInstance.getAllPostsWithSortAndPagination);

postsRouter.get('/:id', postsControllerInstance.getPostById);

postsRouter.get('/:id/comments',postsControllerInstance.getAllCommentsByPostId);

postsRouter.post('/',
    basicAuthorizationCheckMiddleware,
    postsValidationMiddlewaresArray,
    postsControllerInstance.createNewPost
);

postsRouter.post('/:id/comments',
    bearerUserAuthTokenCheckMiddleware,
    body('content').isString().trim().isLength({min: 20, max: 300}),
    catchErrorsMiddleware,
    postsControllerInstance.createNewCommentByPostId
);

postsRouter.put('/:id',
    basicAuthorizationCheckMiddleware,
    postsValidationMiddlewaresArray,
    postsControllerInstance.updatePostById
);

postsRouter.delete('/:id',
    basicAuthorizationCheckMiddleware,
    postsControllerInstance.deletePostById
);