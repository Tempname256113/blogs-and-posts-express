import {Response, Router} from "express";
import {
    queryHT04Type,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody,
    ResponseWithBody
} from "../models/reqResModel";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {postsService} from "../domain/postsService";
import {postsValidationMiddlewaresArray} from "../middlewares/middlewaresArray/postsValidationMiddlewaresArray";
import {errorObjType} from "../models/errorObjModel";
import {postType, requestPostType} from "../models/postModels";
import {postsQueryRepository} from "../repositories/posts/postsQueryRepository";

export const postsRouter = Router();

postsRouter.get('/', async (req: RequestWithQuery<queryHT04Type>, res: Response) => {
    const receivedPost = postsQueryRepository.getPostsWithSortAndPaginationQuery(
        req.query.pageNumber,
        req.query.pageSize,
        req.query.sortBy,
        req.query.sortDirection
    )
    res.status(200).send(receivedPost);
});

postsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getPost = await postsService.getPostByID(req.params.id);
    if (getPost !== null) {
        res.status(200).send(getPost);
    }
    res.status(404).end();
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
        return res.status(404).end();
    }
    res.status(204).end();
});

postsRouter.delete('/:id',
    authorizationMiddleware,
    async (req: RequestWithURIParams<{ id: string }>, res: Response) => {
    if (await postsService.deletePostByID(req.params.id)) {
        return res.status(204).end();
    }
    res.status(404).end();
});