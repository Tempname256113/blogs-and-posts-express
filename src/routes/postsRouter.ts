import {Response, Router} from "express";
import {
    reqQueryPagination,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody,
    ResponseWithBody
} from "../models/reqResModel";
import {authorizationCheckMiddleware} from "../middlewares/authorizationCheckMiddleware";
import {postsService} from "../domain/postsService";
import {postsValidationMiddlewaresArray} from "../middlewares/middlewaresArray/postsValidationMiddlewaresArray";
import {errorObjType} from "../models/errorObjModel";
import {postType, requestPostType} from "../models/postModels";
import {postsQueryRepository} from "../repositories/posts/postsQueryRepository";
import {queryPaginationType} from "../models/queryModels";

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
    if (getPost !== null) {
        return res.status(200).send(getPost);
    }
    res.sendStatus(404);
});

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

postsRouter.put('/:id',
    postsValidationMiddlewaresArray,
    async (req: RequestWithURIParamsAndBody<{id: string}, requestPostType>, res: Response) => {
    if (!await postsService.updatePostByID(req.params.id, req.body)) {
        return res.sendStatus(404);
    }
    res.sendStatus(204);
});

postsRouter.delete('/:id',
    authorizationCheckMiddleware,
    async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    if (await postsService.deletePostByID(req.params.id)) {
        return res.sendStatus(204);
    }
    res.sendStatus(404);
});