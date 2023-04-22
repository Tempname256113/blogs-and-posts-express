import {UsersRepository} from "./repositories/users/users-repository";
import {UsersService} from "./domain/users-service";
import {UsersController} from "./routes/users-controller";
import {UsersQueryRepository} from "./repositories/users/users-query-repository";
import {AuthService} from "./domain/auth-service";
import {AuthRepository} from "./repositories/auth/auth-repository";
import {AuthQueryRepository} from "./repositories/auth/auth-query-repository";
import {SecurityDevicesController} from "./routes/security-devices-controller";
import {PostsController} from "./routes/posts-controller";
import {PostsQueryRepository} from "./repositories/posts/posts-query-repository";
import {CommentsQueryRepository} from "./repositories/comments/comments-query-repository";
import {PostsService} from "./domain/posts-service";
import {BlogsQueryRepository} from "./repositories/blogs/blogs-query-repository";
import {PostsRepository} from "./repositories/posts/posts-repository";
import {CommentsService} from "./domain/comments-service";
import {CommentsRepository} from "./repositories/comments/comments-repository";
import {CommentsController} from "./routes/comments-routes/comments-controller";
import {BlogsController} from "./routes/blogs-routes/blogs-controller";
import {BlogsService} from "./domain/blogs-service";
import {BlogsRepository} from "./repositories/blogs/blogs-repository";
import {AuthController} from "./routes/auth-routes/auth-controller";
import 'reflect-metadata';
import {Container} from "inversify";

// const objects: any[] = [];
//
// const usersRepository = new UsersRepository();
// const usersQueryRepository = new UsersQueryRepository();
// const authRepository = new AuthRepository();
// const authQueryRepository = new AuthQueryRepository();
// const postsQueryRepository = new PostsQueryRepository();
// const commentsQueryRepository = new CommentsQueryRepository();
// const postsRepository = new PostsRepository();
// const commentsRepository = new CommentsRepository();
// const blogsRepository = new BlogsRepository();
// const blogsQueryRepository = new BlogsQueryRepository();
//
//
// const usersService = new UsersService(usersRepository);
// const authService = new AuthService(authRepository, usersQueryRepository, authQueryRepository);
// const postsService = new PostsService(blogsQueryRepository, postsRepository);
// const commentsService = new CommentsService(usersQueryRepository, commentsRepository, commentsQueryRepository);
// const blogsService = new BlogsService(blogsRepository, postsService, blogsQueryRepository);
// objects.push(usersService);
// objects.push(authService);
// objects.push(postsService);
// objects.push(commentsService);
// objects.push(blogsService);
//
//
//
// const usersController = new UsersController(usersQueryRepository, usersService);
// const securityDevicesController = new SecurityDevicesController(authQueryRepository, authService);
// const postsController = new PostsController(postsQueryRepository, commentsQueryRepository, postsService, commentsService);
// const commentsController = new CommentsController(commentsQueryRepository, commentsService);
// const blogsController = new BlogsController(blogsQueryRepository, blogsService);
// const authController = new AuthController(authService, usersQueryRepository);
// objects.push(usersController);
// objects.push(securityDevicesController);
// objects.push(postsController);
// objects.push(commentsController);
// objects.push(blogsController);
// objects.push(authController);


// export const iocContainer = {
//     getInstance<T>(classType: any) {
//         const targetInstance = objects.find(obj => obj instanceof classType);
//         return targetInstance as T;
//     }
// }

export const container = new Container();
//controllers
container.bind<UsersController>(UsersController).to(UsersController);
container.bind<SecurityDevicesController>(SecurityDevicesController).to(SecurityDevicesController);
container.bind<PostsController>(PostsController).to(PostsController);
container.bind<CommentsController>(CommentsController).to(CommentsController);
container.bind<BlogsController>(BlogsController).to(BlogsController);
container.bind<AuthController>(AuthController).to(AuthController);

//query-repos
container.bind<BlogsQueryRepository>(BlogsQueryRepository).to(BlogsQueryRepository);
container.bind<PostsQueryRepository>(PostsQueryRepository).to(PostsQueryRepository);
container.bind<CommentsQueryRepository>(CommentsQueryRepository).to(CommentsQueryRepository);
container.bind<UsersQueryRepository>(UsersQueryRepository).to(UsersQueryRepository);
container.bind<AuthQueryRepository>(AuthQueryRepository).to(AuthQueryRepository);

//repos
container.bind<BlogsRepository>(BlogsRepository).to(BlogsRepository);
container.bind<PostsRepository>(PostsRepository).to(PostsRepository);
container.bind<CommentsRepository>(CommentsRepository).to(CommentsRepository);
container.bind<UsersRepository>(UsersRepository).to(UsersRepository);
container.bind<AuthRepository>(AuthRepository).to(AuthRepository);

//services
container.bind<BlogsService>(BlogsService).to(BlogsService);
container.bind<PostsService>(PostsService).to(PostsService);
container.bind<CommentsService>(CommentsService).to(CommentsService);
container.bind<UsersService>(UsersService).to(UsersService);
container.bind<AuthService>(AuthService).to(AuthService);