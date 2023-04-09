import {PostsQueryRepository} from "../repositories/posts/posts-query-repository";
import {CommentsQueryRepository} from "../repositories/comments/comments-query-repository";
import {PostsService} from "../domain/posts-service";
import {CommentsService} from "../domain/comments-service";
import {
    reqQueryPagination,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody,
    RequestWithURIParamsAndQuery,
    ResponseWithBody
} from "../models/req-res-models";
import {Response} from "express";
import {queryPaginationType} from "../models/query-models";
import {
    ResultOfPaginationCommentsByQueryType,
    ResultOfPaginationPostsByQueryType
} from "../repositories/mongo-DB-features/pagination-by-query-params-functions";
import {PostInTheDBType, PostMethodsType, PostType, RequestPostType} from "../models/post-models";
import {ErrorObjType} from "../models/errorObj-model";
import {CommentType} from "../models/comment-models";
import {AccessTokenPayloadType} from "../models/token-models";
import {jwtMethods} from "./application/jwt-methods";
import {injectable} from "inversify";
import {HydratedDocument} from "mongoose";
import {PostExtendedLikesInfoType} from "../models/post-likes-models";

@injectable()
export class PostsController {
    constructor(
        protected postsQueryRepository: PostsQueryRepository,
        protected commentsQueryRepository: CommentsQueryRepository,
        protected postsService: PostsService,
        protected commentsService: CommentsService
    ) {
    }

    async getAllPostsWithSortAndPagination(req: RequestWithQuery<reqQueryPagination>, res: Response) {
        const paginationConfig: queryPaginationType = {
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10
        };
        const getUserId = (): string | null => {
            const accessToken: string | undefined = req.headers.authorization;
            if (!accessToken) return null;
            const accessTokenPayload: AccessTokenPayloadType | null = jwtMethods.compareToken.accessToken(accessToken);
            if (!accessTokenPayload) return null;
            return accessTokenPayload.userId;
        };
        const userId: string | null = getUserId();
        const receivedPost: ResultOfPaginationPostsByQueryType = await this.postsQueryRepository.getPostsWithSortAndPagination(paginationConfig, userId);
        res.status(200).send(receivedPost);
    };

    async getPostById(req: RequestWithURIParams<{ id: string }>, res: Response) {
        const getUserId = (): string | null => {
            const accessToken: string | undefined = req.headers.authorization;
            if (!accessToken) return null;
            const accessTokenPayload: AccessTokenPayloadType | null = jwtMethods.compareToken.accessToken(accessToken);
            if (!accessTokenPayload) return null;
            return accessTokenPayload.userId;
        };
        const userId: string | null = getUserId();
        const foundedPostById: HydratedDocument<PostInTheDBType, PostMethodsType> | null = await this.postsQueryRepository.getPostByID(req.params.id);
        if (!foundedPostById) return res.sendStatus(404);
        const postLikesInfo: PostExtendedLikesInfoType = await foundedPostById.getLikesInfo(userId);
        const commentToClient: PostType = {
            id: foundedPostById.id,
            title: foundedPostById.title,
            shortDescription: foundedPostById.shortDescription,
            content: foundedPostById.content,
            blogId: foundedPostById.blogId,
            blogName: foundedPostById.blogName,
            createdAt: new Date(foundedPostById.createdAt).toISOString(),
            extendedLikesInfo: {
                likesCount: postLikesInfo.likesCount,
                dislikesCount: postLikesInfo.dislikesCount,
                myStatus: postLikesInfo.myLikeStatus,
                newestLikes: postLikesInfo.newestLikes
            }
        }
        res.status(200).send(commentToClient);
    };

    async getAllCommentsByPostId(
        req: RequestWithURIParamsAndQuery<{ id: string }, queryPaginationType>,
        res: ResponseWithBody<ResultOfPaginationCommentsByQueryType>
    ) {
        const getUserId = (): string | null => {
            const accessToken: string | undefined = req.headers.authorization;
            if (!accessToken) return null;
            const accessTokenPayload: AccessTokenPayloadType | null = jwtMethods.compareToken.accessToken(accessToken);
            if (!accessTokenPayload) return null;
            return accessTokenPayload.userId;
        };
        const userId: string | null = getUserId();
        const foundedPostById: PostInTheDBType | null = await this.postsQueryRepository.getPostByID(req.params.id);
        if (!foundedPostById) return res.sendStatus(404);
        const paginationQueryConfig: { postId: string, userId: string | null } & queryPaginationType = {
            postId: req.params.id,
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10,
            userId
        }
        const commentsWithPagination: ResultOfPaginationCommentsByQueryType = await this.commentsQueryRepository.getCommentsWithPagination(paginationQueryConfig);
        res.status(200).send(commentsWithPagination);
    };

    async createNewPost(req: RequestWithBody<RequestPostType>, res: ResponseWithBody<ErrorObjType | PostType>) {
        const createdPost: PostType = await this.postsService.createNewPost({
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
    ) {
        const foundedPost: PostInTheDBType | null = await this.postsQueryRepository.getPostByID(req.params.id);
        if (!foundedPost) return res.sendStatus(404);
        const dataForCreateNewComment = {
            content: req.body.content,
            userId: req.context.accessTokenPayload!.userId,
            postId: req.params.id
        }
        const newCreatedComment: CommentType = await this.commentsService.createComment(dataForCreateNewComment);
        res.status(201).send(newCreatedComment);
    };

    async updatePostById(req: RequestWithURIParamsAndBody<{ id: string }, RequestPostType>, res: Response) {
        const updatePostStatus: boolean = await this.postsService.updatePostByID(req.params.id, req.body);
        updatePostStatus ? res.sendStatus(204) : res.sendStatus(404);
    };

    async deletePostById(req: RequestWithURIParams<{ id: string }>, res: Response) {
        const deletePostStatus: boolean = await this.postsService.deletePostByID(req.params.id);
        deletePostStatus ? res.sendStatus(204) : res.sendStatus(404);
    };

    async changeLikeStatus(
        req: RequestWithURIParamsAndBody<{postId: string}, {likeStatus: 'None' | 'Like' | 'Dislike'}>,
        res: Response
    ) {
        const foundedPostById: HydratedDocument<PostInTheDBType, PostMethodsType> | null = await this.postsQueryRepository.getPostByID(req.params.postId);
        if (!foundedPostById) return res.sendStatus(404);
        const userId: string = req.context.accessTokenPayload!.userId;
        await this.postsService.changeLikeStatus({likeStatus: req.body.likeStatus, userId, postId: req.params.postId});
        res.sendStatus(204);
    }
}