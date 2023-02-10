import express, {Request, Response} from "express";
import {blogsRouter} from "./routes/blogs-router";
import {postsRouter} from "./routes/posts-router";
import {postsService} from "./domain/posts-service";
import {blogsService} from "./domain/blogs-service";
import {usersRouter} from "./routes/users-router";
import {usersService} from "./domain/users-service";
import {authRouter} from "./routes/auth-router";
import {commentsRouter} from "./routes/comments-router";
import {commentsService} from "./domain/comments-service";
import cookieParser from "cookie-parser";
import {authService} from "./domain/auth-service";
import {
    counterOfRequestsByASingleIpMiddlewareConfig
} from "./middlewares/counter-of-requests-by-a-single-ip-middleware";

export const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(cookieParser());
app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);
app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await Promise.all([
        blogsService.deleteAllData(),
        postsService.deleteAllData(),
        usersService.deleteAllData(),
        commentsService.deleteAllData(),
        authService.deleteAllBannedRefreshTokens()
    ]);
    res.sendStatus(204);
});

app.get('/auth/login',
    // counterOfRequestsByASingleIpMiddlewareConfig(),
    (req, res) => {
    console.log(req.originalUrl);
    console.log(req.ip);
    res.sendStatus(200)
})