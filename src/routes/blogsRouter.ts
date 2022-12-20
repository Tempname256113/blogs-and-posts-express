import {Request, Response, Router} from "express";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {body, validationResult} from "express-validator";
import {RequestWithBody, RequestWithURIParams, RequestWithURIParamsAndBody} from "../ReqResTypes";
import {IRequestBlogModel} from "../models/models";
import {createErrorMessage} from "../createErrorMessage";
import {blogsRepositoryDB} from "../repositories/blogsRepositoryDB";

export const blogsRouter = Router();

blogsRouter.get('/', async (req: Request, res: Response) => {
    res.status(200).send(await blogsRepositoryDB.getAllBlogs());
});

blogsRouter.post('/',
    authorizationMiddleware,
    body('name',).isString().trim().isLength({max: 15, min: 1}),
    body('description',).isString().trim().isLength({max: 500, min: 1}),
    body('websiteUrl',).isString().trim().isLength({max: 100, min: 1}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$'),
    async (req: RequestWithBody<IRequestBlogModel>, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(createErrorMessage(errors.array()));
        }
        res.status(201).send(await blogsRepositoryDB.createNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }))
});

blogsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getBlog: any = await blogsRepositoryDB.getBlogByID(req.params.id);
    if (getBlog === null) {
        res.status(200).send(getBlog)
    } else {
        res.status(404).end();
    }
});

blogsRouter.put('/:id',
    authorizationMiddleware,
    body('name').isString().trim().isLength({max: 15, min: 1}),
    body('description').isString().trim().isLength({max: 500, min: 1}),
    body('websiteUrl').isString().trim().isLength({max: 100, min: 1}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$'),
    async (req: RequestWithURIParamsAndBody<{id: string}, IRequestBlogModel>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(createErrorMessage(errors.array()));
    }
    if (await blogsRepositoryDB.updateBlogByID(req.params.id,
        {name: req.body.name, description: req.body.description, websiteUrl: req.body.websiteUrl})) {
        return res.status(204).end();
    }
    res.status(404).end();
});

blogsRouter.delete('/:id',
    authorizationMiddleware,
    async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    if (await blogsRepositoryDB.deleteBlogByID(req.params.id)) {
        return res.status(204).end();
    }
    res.status(404).end();
});