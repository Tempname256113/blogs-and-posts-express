import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogsRepository";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {body, validationResult} from "express-validator";
import {RequestWithBody, RequestWithURIParams, RequestWithURIParamsAndBody} from "../ReqResTypes";
import {IRequestBlogModel} from "../models/models";
import {createErrorMessage} from "../createErrorMessage";
import {IBlog} from "../models/models";

export const blogsRouter = Router();

blogsRouter.get('/', (req: Request, res: Response) => {
    res.status(200).send(blogsRepository.getAllBlogs());
});

blogsRouter.post('/',
    authorizationMiddleware,
    body('name',).isString().trim().isLength({max: 15}),
    body('description',).isString().trim().isLength({max: 500}),
    body('websiteUrl',).isString().trim().isLength({max: 100}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$'),
    (req: RequestWithBody<IRequestBlogModel>, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(createErrorMessage(errors.array()));
        }
        res.status(201).send(blogsRepository.createNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }))
});

blogsRouter.get('/:id', (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const getBlog: IBlog | undefined = blogsRepository.getBlogByID(req.params.id);
    if (getBlog) {
        res.status(200).send(getBlog)
    } else {
        res.status(404).end();
    }
});

blogsRouter.put('/:id',
    authorizationMiddleware,
    body('name').isString().trim().isLength({max: 15}),
    body('description').isString().trim().isLength({max: 500}),
    body('websiteUrl').isString().trim().isLength({max: 100}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$'),
    (req: RequestWithURIParamsAndBody<{id: string}, IRequestBlogModel>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(createErrorMessage(errors.array()));
    }
    if (blogsRepository.updateBlogByID(req.params.id,
        {name: req.body.name, description: req.body.description, websiteUrl: req.body.websiteUrl})) {
        return res.status(204).end();
    }
    res.status(404).end();
});

blogsRouter.delete('/:id',
    authorizationMiddleware,
    (req: RequestWithURIParams<{id: string}>, res: Response) => {
    if (blogsRepository.deleteBlogByID(req.params.id)) {
        return res.status(204).end();
    }
    res.status(404).end();
});