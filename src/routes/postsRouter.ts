import {Response, Request, Router} from "express";
import {postsRepository} from "../repositories/postsRepository";
import {RequestWithBody, RequestWithURIParams, RequestWithURIParamsAndBody, ResponseWithBody} from "../ReqResTypes";
import {IErrorObj, IPost, IRequestPostModel} from "../models/models";
import {body, validationResult} from "express-validator";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {createErrorMessage} from "../createErrorMessage";
import {blogIdCustomMiddleware} from "../middlewares/blogIdCustomMiddleware";


export const postsRouter = Router();

postsRouter.get('/', (req: Request, res: Response) => {
    res.status(200).send(postsRepository.getAllPosts());
});

postsRouter.post('/',
    authorizationMiddleware,
    body('title').isString().isLength({max: 30}),
    body('shortDescription').isString().isLength({max: 100}),
    body('content').isString().isLength({max: 1000}),
    body('blogId').isString().custom((value, {req}) => {
        return blogIdCustomMiddleware(req);
    }),
    (req: RequestWithBody<IRequestPostModel>, res: ResponseWithBody<IErrorObj | IPost>) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(createErrorMessage(errors.array()));
        }
        res.status(201).send(postsRepository.createNewPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        }));
});

postsRouter.get('/:id', (req: RequestWithURIParams<{id: string}>, res: ResponseWithBody<IPost>) => {
    const getPost = postsRepository.getPostByID(req.params.id);
    if (getPost) {
        res.status(200).send(getPost);
    }
    res.status(404).end();
});

postsRouter.put('/:id',
    authorizationMiddleware,
    body('title').isString().isLength({max: 30}),
    body('shortDescription').isString().isLength({max: 100}),
    body('content').isString().isLength({max: 1000}),
    body('blogId').isString().custom((value, {req}) => {
        return blogIdCustomMiddleware(req);
    }),
    (req: RequestWithURIParamsAndBody<{id: string}, IRequestPostModel>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(createErrorMessage(errors.array()));
    }
    if (!postsRepository.getPostByID(req.params.id)) {
        return res.status(404).end();
    }
    postsRepository.updatePostByID(req.params.id, req.body);
    res.status(204).end();
});

// надо сделать еще роут на удаление и один общий роут очищение всех баз данных.
// для PUT метода простые тесты я уже написал, все работает. надо будет после delete написать простой тест и проверить
// после последнего роута и теста нужно тестировать полностью все роуты постов на ошибки