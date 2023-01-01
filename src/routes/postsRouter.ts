import {Response, Request, Router} from "express";
import {RequestWithBody, RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../models/reqResModel";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {postsService} from "../domain/postsService";
import {postsValidationMiddlewaresArray} from "../middlewares/middlewaresArray/postsValidationMiddlewaresArray";
import {errorObjType} from "../models/errorObjModel";
import {postType, requestPostType} from "../models/postModels";


export const postsRouter = Router();

postsRouter.get('/', async (req: Request, res: Response) => {
    res.status(200).send(await postsService.getAllPosts());
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

postsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getPost = await postsService.getPostByID(req.params.id);
    if (getPost !== null) {
        res.status(200).send(getPost);
    }
    res.status(404).end();
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