import express, {Request, Response} from "express";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";
import {postsService} from "./domain/postsService";
import {blogsService} from "./domain/blogsService";
import {body} from "express-validator";
import {usersRouter} from "./routes/usersRouter";
import {catchErrorsMiddleware} from "./middlewares/catchErrorsMiddleware";
import {RequestWithBody} from "./models/reqResModel";
import {usersService} from "./domain/usersService";

export const app = express();

app.use(express.json());
app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await Promise.all([blogsService.deleteAllData(), postsService.deleteAllData(), usersService.deleteAllData()]);
    res.sendStatus(204);
});
app.post('/auth/login',
    body('loginOrEmail').isString().trim().isLength({min: 1}),
    body('password').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    async (req: RequestWithBody<{loginOrEmail: string, password: string}>, res: Response) => {
    const userAuthentificationStatus = await usersService.authUser({loginOrEmail: req.body.loginOrEmail, password: req.body.password});
    if (userAuthentificationStatus) return res.sendStatus(204);
    res.sendStatus(401);
});