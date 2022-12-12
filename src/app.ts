import express, {Request, Response, NextFunction} from "express";
import {body, check, validationResult} from "express-validator";
import {blogsRepository} from "./repositories/blogsRepository";
import {authorizationMiddleware} from "./middlewares/authorizationMiddleware";
import {RequestWithBody} from "./ReqResTypes";
import {IRequestBlogModel} from "./models/RequestBlogModel";
import {createErrorMessage} from "./createErrorMessage";

export const app = express();

app.use(express.json());

app.get('/blogs', (req: Request, res: Response) => {
    res.status(200).send(blogsRepository.getAllBlogs());
});

app.post('/blogs',
    authorizationMiddleware,
    body('name',).isString().isLength({max: 15}),
    body('description',).isString().isLength({max: 500}),
    body('websiteUrl',).isString().isLength({max: 100}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$'),
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