import {Response, Request, Router} from "express";
import {RequestWithBody, RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../ReqResTypes";
import {IErrorObj, IPost, IRequestPostModel} from "../models/models";
import {body, validationResult} from "express-validator";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {createErrorMessage} from "../createErrorMessage";
import {blogIdCustomMiddleware} from "../middlewares/blogIdCustomMiddleware";
import {postsRepositoryDB} from "../repositories/postsRepositoryDB";


export const postsRouter = Router();

postsRouter.get('/', async (req: Request, res: Response) => {
    res.status(200).send(await postsRepositoryDB.getAllPosts());
});

postsRouter.post('/',
    authorizationMiddleware,
    body('title').isString().trim().isLength({max: 30, min: 1}),
    body('shortDescription').isString().trim().isLength({max: 100, min: 1}),
    body('content').isString().trim().isLength({max: 1000, min: 1}),
    body('blogId').isString().trim().custom((value, {req}) => {
        return blogIdCustomMiddleware(req);
    }),
    async (req: RequestWithBody<IRequestPostModel>, res: ResponseWithBody<IErrorObj | IPost>) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(createErrorMessage(errors.array()));
        }
        res.status(201).send(await postsRepositoryDB.createNewPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        }));
});

postsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getPost = await postsRepositoryDB.getPostByID(req.params.id);
    if (getPost !== null) {
        res.status(200).send(getPost);
    }
    res.status(404).end();
});

postsRouter.put('/:id',
    authorizationMiddleware,
    body('title').isString().trim().isLength({max: 30, min: 1}),
    body('shortDescription').trim().isString().isLength({max: 100, min: 1}),
    body('content').isString().trim().isLength({max: 1000, min: 1}),
    body('blogId').isString().trim().custom((value, {req}) => {
        return blogIdCustomMiddleware(req);
    }),
    async (req: RequestWithURIParamsAndBody<{id: string}, IRequestPostModel>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(createErrorMessage(errors.array()));
    }
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