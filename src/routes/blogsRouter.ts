import {Request, Response, Router} from "express";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {RequestWithBody, RequestWithURIParams, RequestWithURIParamsAndBody} from "../models/reqResModel";
import {blogsRepositoryDB} from "../repositories/blogsRepositoryDB";
import {blogsValidationMiddlewaresArray} from "../middlewares/middlewaresArray/blogsValidationMiddlewaresArray";
import {IRequestBlogModel} from "../models/blogModels";

export const blogsRouter = Router();

blogsRouter.get('/', async (req: Request, res: Response) => {
    res.status(200).send(await blogsRepositoryDB.getAllBlogs());
});

blogsRouter.post('/',
    blogsValidationMiddlewaresArray,
    async (req: RequestWithBody<IRequestBlogModel>, res: Response) => {
        res.status(201).send(await blogsRepositoryDB.createNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }))
});

blogsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getBlog: any = await blogsRepositoryDB.getBlogByID(req.params.id);
    if (getBlog !== null) {
        res.status(200).send(getBlog)
    } else {
        res.status(404).end();
    }
});

blogsRouter.put('/:id',
    blogsValidationMiddlewaresArray,
    async (req: RequestWithURIParamsAndBody<{id: string}, IRequestBlogModel>, res: Response) => {
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