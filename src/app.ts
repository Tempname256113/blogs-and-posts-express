import express, {Request, Response} from "express";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";
import {postsService} from "./domain/postsService";
import {blogsService} from "./domain/blogsService";
import {usersRouter} from "./routes/usersRouter";
import {usersService} from "./domain/usersService";
import {authRouter} from "./routes/authRouter";
import {commentsRouter} from "./routes/commentsRouter";
import {commentsService} from "./domain/commentsService";
import cookieParser from "cookie-parser";
import {authService} from "./domain/authService";

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