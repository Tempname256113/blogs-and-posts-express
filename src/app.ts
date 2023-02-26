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
import {securityDevicesRouter} from "./routes/security-devices-router";
import {jwtMethods} from "./routes/application/jwt-methods";
import {requestLimiterMiddleware} from "./middlewares/request-limiter-middleware";
import {requestLimiterRepository} from "./repositories/request-limiter-middleware/request-limiter-repository";

export const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(cookieParser());
app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);
app.use('/security/devices', securityDevicesRouter);
app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await Promise.all([
        blogsService.deleteAllData(),
        postsService.deleteAllData(),
        usersService.deleteAllData(),
        commentsService.deleteAllData(),
        authService.deleteAllSessions(),
        requestLimiterRepository.deleteAllIpAddresses()
    ]);
    res.sendStatus(204);
});

// app.get('/auth/login',
//     counterOfRequestsByASingleIpMiddleware,
//     (req, res) => {
//     // console.log(req.originalUrl);
//     // console.log(req.ip);
//     res.sendStatus(200)
// })

// app.get('/test-route',
//     requestLimiterMiddleware,
//     (req, res) => {
//     console.log(req.query);
//     console.log(req.headers["user-agent"]);
//     console.log(new Date().toISOString());
//     console.log(req.originalUrl);
//     const refreshToken = jwtMethods.createToken.refreshToken({refreshTokenProp: 'this is refresh token, ok'});
//     res.cookie('testCookieProp', refreshToken, {httpOnly: true, secure: true}).status(200).send('ready or not');
// })