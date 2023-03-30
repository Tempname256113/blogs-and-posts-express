import {Response, Router} from "express";
import {basicAuthorizationCheckMiddleware} from "../middlewares/basic-authorization-check-middleware";
import {
    RequestWithBody,
    RequestWithQuery, RequestWithURIParamsAndQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody, reqQueryPagination
} from "../models/req-res-models";
import {BlogsService} from "../domain/blogs-service";
import {blogsValidationMiddlewaresArray} from "../middlewares/middlewares-arrays/blogs-validation-middlewares-array";
import {BlogType, RequestBlogType} from "../models/blog-models";
import {BlogsQueryRepository} from "../repositories/blogs/blogs-query-repository";
import {blogIdUriParamCheckMiddleware} from "../middlewares/blogId-uri-param-check-middleware";
import {
    postsValidationMiddlewaresArrayWithUriBlogIdCheck
} from "../middlewares/middlewares-arrays/posts-validation-middlewares-array";
import {PostType, RequestPostType} from "../models/post-models";
import {queryPaginationType} from "../models/query-models";
import {
    ResultOfPaginationBlogsByQueryType, ResultOfPaginationPostsByQueryType
} from "../repositories/mongo-DB-features/pagination-by-query-params-functions";

class BlogsController {
    private blogsQueryRepository: BlogsQueryRepository;
    private blogsService: BlogsService;
    constructor() {
        this.blogsQueryRepository = new BlogsQueryRepository();
        this.blogsService = new BlogsService();
    }
    async getAllBlogsWithSortAndPagination(
        req: RequestWithQuery<{searchNameTerm: string | undefined} & reqQueryPagination>,
        res: Response
    ){
        const paginationConfig: {searchNameTerm: string | undefined} & queryPaginationType = {
            searchNameTerm: req.query.searchNameTerm,
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10
        }
        const receivedBlogs: ResultOfPaginationBlogsByQueryType = await this.blogsQueryRepository.getBlogsWithSortAndPagination(paginationConfig);
        res.status(200).send(receivedBlogs);
    };
    async getBlogById(req: RequestWithURIParams<{id: string}>, res: Response<BlogType>){
        const blog: BlogType | null = await this.blogsQueryRepository.getBlogByID(req.params.id);
        blog ? res.status(200).send(blog) : res.sendStatus(404);
    };
    async getAllPostsByBlogId(
        req: RequestWithURIParamsAndQuery<{blogId: string}, reqQueryPagination>,
        res: Response<ResultOfPaginationPostsByQueryType>
    ){
        const paginationConfig: {blogId: string} & queryPaginationType = {
            blogId: req.params.blogId,
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10,
        }
        const posts: ResultOfPaginationPostsByQueryType = await this.blogsQueryRepository.getAllPostsForSpecifiedBlog(paginationConfig);
        res.status(200).send(posts);
    };
    async createNewBlog(req: RequestWithBody<RequestBlogType>, res: Response<BlogType>){
        const newBlogTemplate: RequestBlogType = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const createdBlog: BlogType = await this.blogsService.createNewBlog(newBlogTemplate);
        res.status(201).send(createdBlog);
    };
    async createNewPostByBlogId(req: RequestWithURIParamsAndBody<{blogId: string}, RequestPostType>, res: Response<PostType>){
        const newPostTemplate: RequestPostType = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.params.blogId
        };
        const createdPost: PostType = await this.blogsService.createNewPostForSpecificBlog(newPostTemplate);
        res.status(201).send(createdPost);
    };
    async updateBlogById(req: RequestWithURIParamsAndBody<{id: string}, RequestBlogType>, res: Response){
        const updateBlogTemplate: RequestBlogType = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const blogUpdateStatus: boolean = await this.blogsService.updateBlogByID(req.params.id, updateBlogTemplate);
        blogUpdateStatus ? res.sendStatus(204) : res.sendStatus(404);
    };
    async deleteBlogById(req: RequestWithURIParams<{id: string}>, res: Response){
        const deletedBlogStatus: boolean = await this.blogsService.deleteBlogByID(req.params.id);
        deletedBlogStatus ? res.sendStatus(204) : res.sendStatus(404);
    }
}

const blogsControllerInstance = new BlogsController();
export const blogsRouter = Router();

blogsRouter.get('/', blogsControllerInstance.getAllBlogsWithSortAndPagination.bind(blogsControllerInstance));

blogsRouter.get('/:id', blogsControllerInstance.getBlogById.bind(blogsControllerInstance));

blogsRouter.get('/:blogId/posts',
    blogIdUriParamCheckMiddleware,
    blogsControllerInstance.getAllPostsByBlogId.bind(blogsControllerInstance)
);

blogsRouter.post('/',
    basicAuthorizationCheckMiddleware,
    blogsValidationMiddlewaresArray,
    blogsControllerInstance.createNewBlog.bind(blogsControllerInstance)
);

blogsRouter.post('/:blogId/posts',
    basicAuthorizationCheckMiddleware,
    postsValidationMiddlewaresArrayWithUriBlogIdCheck,
    blogsControllerInstance.createNewPostByBlogId.bind(blogsControllerInstance)
);

blogsRouter.put('/:id',
    basicAuthorizationCheckMiddleware,
    blogsValidationMiddlewaresArray,
    blogsControllerInstance.updateBlogById.bind(blogsControllerInstance)
);

blogsRouter.delete('/:id',
    basicAuthorizationCheckMiddleware,
    blogsControllerInstance.deleteBlogById.bind(blogsControllerInstance)
);