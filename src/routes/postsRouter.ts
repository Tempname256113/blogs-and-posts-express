import {Response, Request, Router} from "express";
import {RequestWithBody, RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../models/reqResModel";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {postsRepositoryDB} from "../repositories/postsRepositoryDB";
import {postsValidationMiddlewaresArray} from "../middlewares/middlewaresArray/postsValidationMiddlewaresArray";
import {IErrorObj} from "../models/errorObjModel";
import {IPost, IRequestPostModel} from "../models/postModels";


export const postsRouter = Router();

postsRouter.get('/', async (req: Request, res: Response) => {
    res.status(200).send(await postsRepositoryDB.getAllPosts());
});

postsRouter.post('/',
    postsValidationMiddlewaresArray,
    async (req: RequestWithBody<IRequestPostModel>, res: ResponseWithBody<IErrorObj | IPost>) => {
    const createdPost: IPost = await postsRepositoryDB.createNewPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        })
    res.status(201).send(createdPost);
});

postsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getPost = await postsRepositoryDB.getPostByID(req.params.id);
    if (getPost !== null) {
        res.status(200).send(getPost);
    }
    res.status(404).end();
});

postsRouter.put('/:id',
    postsValidationMiddlewaresArray,
    async (req: RequestWithURIParamsAndBody<{id: string}, IRequestPostModel>, res: Response) => {
    if (!await postsRepositoryDB.updatePostByID(req.params.id, req.body)) {
        return res.status(404).end();
    }
    res.status(204).end();
});

postsRouter.delete('/:id',
    authorizationMiddleware,
    async (req: RequestWithURIParams<{ id: string }>, res: Response) => {
    if (await postsRepositoryDB.deletePostByID(req.params.id)) {
        return res.status(204).end();
    }
    res.status(404).end();
});