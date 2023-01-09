import {Response, Router} from "express";
import {authorizationCheckMiddleware} from "../middlewares/authorizationCheckMiddleware";
import {
    RequestWithBody,
    RequestWithQuery, RequestWithURIParamsAndQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody, reqQueryPagination
} from "../models/reqResModel";
import {blogsService} from "../domain/blogsService";
import {blogsValidationMiddlewaresArray} from "../middlewares/middlewaresArray/blogsValidationMiddlewaresArray";
import {requestBlogType} from "../models/blogModels";
import {blogsQueryRepository} from "../repositories/blogs/blogsQueryRepository";
import {blogIdUriParamCheckMiddleware} from "../middlewares/blogIdUriParamCheckMiddleware";
import {
    postsValidationMiddlewaresArrayWithUriBlogIdCheck
} from "../middlewares/middlewaresArray/postsValidationMiddlewaresArray";
import {requestPostType} from "../models/postModels";
import {queryPaginationType} from "../models/queryModels";

export const blogsRouter = Router();

blogsRouter.get('/',
    async (req: RequestWithQuery<{searchNameTerm: string | undefined} & reqQueryPagination>, res: Response) => {
    const paginationConfig: {searchNameTerm: string | undefined} & queryPaginationType = {
        searchNameTerm: req.query.searchNameTerm,
        sortBy: req.query.sortBy ?? 'createdAt',
        sortDirection: req.query.sortDirection ?? 'desc',
        pageNumber: req.query.pageNumber ?? 1,
        pageSize: req.query.pageSize ?? 10
    }
    const receivedBlogs = await blogsQueryRepository.getBlogsWithSortAndPagination(paginationConfig);
    res.status(200).send(receivedBlogs);
});

blogsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const blog = await blogsQueryRepository.getBlogByID(req.params.id);
    if (blog !== null) {
        res.status(200).send(blog)
    } else {
        res.sendStatus(404);
    }
});

blogsRouter.get('/:blogId/posts',
    blogIdUriParamCheckMiddleware,
    async (req: RequestWithURIParamsAndQuery<{blogId: string}, reqQueryPagination>, res: Response) => {
        const paginationConfig: {blogId: string} & queryPaginationType = {
            blogId: req.params.blogId,
            sortBy: req.query.sortBy ?? 'createdAt',
            sortDirection: req.query.sortDirection ?? 'desc',
            pageNumber: req.query.pageNumber ?? 1,
            pageSize: req.query.pageSize ?? 10,
        }
        const posts = await blogsQueryRepository.getAllPostsForSpecifiedBlog(paginationConfig);
        res.status(200).send(posts);
});

blogsRouter.post('/',
    blogsValidationMiddlewaresArray,
    async (req: RequestWithBody<requestBlogType>, res: Response) => {
    const newBlogTemplate: requestBlogType = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    };
    const createdBlog = await blogsService.createNewBlog(newBlogTemplate);
    res.status(201).send(createdBlog);
});

blogsRouter.post('/:blogId/posts',
    postsValidationMiddlewaresArrayWithUriBlogIdCheck,
    async (req: RequestWithURIParamsAndBody<{blogId: string}, requestPostType>, res: Response) => {
    const newPostTemplate: requestPostType = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: req.params.blogId
    };
    const createdPost = await blogsService.createNewPostForSpecificBlog(newPostTemplate);
    res.status(201).send(createdPost);
})

blogsRouter.put('/:id',
    blogsValidationMiddlewaresArray,
    async (req: RequestWithURIParamsAndBody<{id: string}, requestBlogType>, res: Response) => {
    const updateBlogTemplate: requestBlogType = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    };
    const updateStatus: boolean = await blogsService.updateBlogByID(req.params.id, updateBlogTemplate);
    if (updateStatus) {
        return res.sendStatus(204);
    }
    res.sendStatus(404);
});

blogsRouter.delete('/:id',
    authorizationCheckMiddleware,
    async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    if (await blogsService.deleteBlogByID(req.params.id)) {
        return res.sendStatus(204);
    }
    res.sendStatus(404);
});