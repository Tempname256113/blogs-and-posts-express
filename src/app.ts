import express, {Request, Response} from "express";
import {blogsRouter} from "./routes/blogs-routes/blogs-router";
import {postsRouter} from "./routes/posts-routes/posts-router";
import {usersRouter} from "./routes/users-router";
import {authRouter} from "./routes/auth-routes/auth-router";
import {commentsRouter} from "./routes/comments-routes/comments-router";
import cookieParser from "cookie-parser";
import {securityDevicesRouter} from "./routes/security-routes/security-devices-router";
import {jwtMethods} from "./routes/application/jwt-methods";
import {requestLimiterMiddleware} from "./middlewares/request-limiter-middleware";
import {requestLimiterRepository} from "./repositories/request-limiter-middleware/request-limiter-repository";
import {body, validationResult} from "express-validator";
import {checkRequestRefreshTokenCookieMiddleware} from "./middlewares/check-request-refreshToken-cookie-middleware";
import {catchErrorsMiddleware} from "./middlewares/catch-errors-middleware";
import {container} from "./composition-root";
import {AuthService} from "./domain/auth-service";
import {BlogsService} from "./domain/blogs-service";
import {PostsService} from "./domain/posts-service";
import {UsersService} from "./domain/users-service";
import {CommentsService} from "./domain/comments-service";

const blogsService = container.resolve(BlogsService);
const postsService = container.resolve(PostsService);
const usersService = container.resolve(UsersService);
const commentsService = container.resolve(CommentsService);
const authService = container.resolve(AuthService);

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
        commentsService.deleteAllCommentsLikes(),
        postsService.deleteAllPostsLikes(),
        authService.deleteAllSessions(),
        requestLimiterRepository.deleteAllIpAddresses()
    ]);
    res.sendStatus(204);
});


// app.post('/test',
//     requestLimiterMiddleware,
//     // checkRequestRefreshTokenCookieMiddleware,
//     body('email').isEmail(),
//     catchErrorsMiddleware,
//     (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.sendStatus(400);
//     res.send('test route');
// })

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