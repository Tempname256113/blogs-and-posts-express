import {BlogsQueryRepository} from "../repositories/blogs/blogs-query-repository";
import {BlogsService} from "../domain/blogs-service";
import {
    reqQueryPagination,
    RequestWithBody,
    RequestWithQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody,
    RequestWithURIParamsAndQuery
} from "../models/req-res-models";
import {Response} from "express";
import {queryPaginationType} from "../models/query-models";
import {
    ResultOfPaginationBlogsByQueryType,
    ResultOfPaginationPostsByQueryType
} from "../repositories/mongo-DB-features/pagination-by-query-params-functions";
import {BlogType, RequestBlogType} from "../models/blog-models";
import {PostInTheDBType, PostType, RequestPostType} from "../models/post-models";
import {injectable} from "inversify";
import {AccessTokenPayloadType} from "../models/token-models";
import {jwtMethods} from "./application/jwt-methods";

@injectable()
export class BlogsController {
    constructor(protected blogsQueryRepository: BlogsQueryRepository, protected blogsService: BlogsService) {
    }

    async getAllBlogsWithSortAndPagination(
        req: RequestWithQuery<{ searchNameTerm: string | undefined } & reqQueryPagination>,
        res: Response
    ) {
        const paginationConfig: { searchNameTerm: string | undefined } & queryPaginationType = {
            searchNameTerm: req.query.searchNameTerm,
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10
        }
        const receivedBlogs: ResultOfPaginationBlogsByQueryType = await this.blogsQueryRepository.getBlogsWithSortAndPagination(paginationConfig);
        res.status(200).send(receivedBlogs);
    };

    async getBlogById(req: RequestWithURIParams<{ id: string }>, res: Response<BlogType>) {
        const blog: BlogType | null = await this.blogsQueryRepository.getBlogByID(req.params.id);
        blog ? res.status(200).send(blog) : res.sendStatus(404);
    };

    async getAllPostsByBlogId(
        req: RequestWithURIParamsAndQuery<{ blogId: string }, reqQueryPagination>,
        res: Response<ResultOfPaginationPostsByQueryType>
    ) {
        const paginationConfig: { blogId: string } & queryPaginationType = {
            blogId: req.params.blogId,
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10,
        };
        const getUserId = (): string | null => {
            const accessToken: string | undefined = req.headers.authorization;
            if (!accessToken) return null;
            const accessTokenPayload: AccessTokenPayloadType | null = jwtMethods.compareToken.accessToken(accessToken);
            if (!accessTokenPayload) return null;
            return accessTokenPayload.userId;
        };
        const userId: string | null = getUserId();
        const posts: ResultOfPaginationPostsByQueryType = await this.blogsQueryRepository.getAllPostsForSpecifiedBlog(paginationConfig, userId);
        res.status(200).send(posts);
    };

    async createNewBlog(req: RequestWithBody<RequestBlogType>, res: Response<BlogType>) {
        const newBlogTemplate: RequestBlogType = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const createdBlog: BlogType = await this.blogsService.createNewBlog(newBlogTemplate);
        res.status(201).send(createdBlog);
    };

    async createNewPostByBlogId(req: RequestWithURIParamsAndBody<{ blogId: string }, RequestPostType>, res: Response<PostType>) {
        const newPostTemplate: RequestPostType = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.params.blogId
        };
        const createdPost: PostType = await this.blogsService.createNewPostForSpecificBlog(newPostTemplate);
        res.status(201).send(createdPost);
    };

    async updateBlogById(req: RequestWithURIParamsAndBody<{ id: string }, RequestBlogType>, res: Response) {
        const updateBlogTemplate: RequestBlogType = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const blogUpdateStatus: boolean = await this.blogsService.updateBlogByID(req.params.id, updateBlogTemplate);
        blogUpdateStatus ? res.sendStatus(204) : res.sendStatus(404);
    };

    async deleteBlogById(req: RequestWithURIParams<{ id: string }>, res: Response) {
        const deletedBlogStatus: boolean = await this.blogsService.deleteBlogByID(req.params.id);
        deletedBlogStatus ? res.sendStatus(204) : res.sendStatus(404);
    }
}