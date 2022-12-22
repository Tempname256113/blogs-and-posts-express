import {Response, Router} from "express";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {
    queryHT04Type,
    RequestWithBody,
    RequestWithQueryHT04,
    RequestWithURIParams,
    RequestWithURIParamsAndBody
} from "../models/reqResModel";
import {blogsService} from "../domain/blogsService";
import {blogsValidationMiddlewaresArray} from "../middlewares/middlewaresArray/blogsValidationMiddlewaresArray";
import {requestBlogType} from "../models/blogModels";
import {blogsQueryRepository} from "../repositories/blogs/blogsQueryRepository";

export const blogsRouter = Router();

blogsRouter.get('/', async (req: RequestWithQueryHT04<queryHT04Type>, res: Response) => {
    res.status(200).send(await blogsQueryRepository.getBlogByQueryHT04(
        req.query.searchNameTerm,
        req.query.sortBy,
        req.query.sortDirection,
        req.query.pageNumber,
        req.query.pageSize
    ));
});

blogsRouter.post('/',
    blogsValidationMiddlewaresArray,
    async (req: RequestWithBody<requestBlogType>, res: Response) => {
        res.status(201).send(await blogsService.createNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }))
});

blogsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getBlog: any = await blogsService.getBlogByID(req.params.id);
    if (getBlog !== null) {
        res.status(200).send(getBlog)
    } else {
        res.status(404).end();
    }
});

blogsRouter.put('/:id',
    blogsValidationMiddlewaresArray,
    async (req: RequestWithURIParamsAndBody<{id: string}, requestBlogType>, res: Response) => {
    if (await blogsService.updateBlogByID(req.params.id,
        {name: req.body.name, description: req.body.description, websiteUrl: req.body.websiteUrl})) {
        return res.status(204).end();
    }
    res.status(404).end();
});

blogsRouter.delete('/:id',
    authorizationMiddleware,
    async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    if (await blogsService.deleteBlogByID(req.params.id)) {
        return res.status(204).end();
    }
    res.status(404).end();
});