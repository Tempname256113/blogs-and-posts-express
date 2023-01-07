import {Response, Router} from "express";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
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
    const createdBlog = await blogsService.createNewBlog({
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    })
    res.status(201).send(createdBlog);
});

blogsRouter.post('/:blogId/posts',
    postsValidationMiddlewaresArrayWithUriBlogIdCheck,
    async (req: RequestWithURIParamsAndBody<{blogId: string}, requestPostType>, res: Response) => {
    const createdPost = await blogsService.createNewPostForSpecificBlog(
        {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.params.blogId
        }
    )
    res.status(201).send(createdPost);
})

blogsRouter.put('/:id',
    blogsValidationMiddlewaresArray,
    async (req: RequestWithURIParamsAndBody<{id: string}, requestBlogType>, res: Response) => {
    const updateStatus = await blogsService.updateBlogByID(
        req.params.id,
        {name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
            }
    )
    if (updateStatus) {
        return res.status(204).end();
    }
    res.status(404).end();
});

blogsRouter.delete('/:id',
    authorizationMiddleware,
    async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    if (await blogsService.deleteBlogByID(req.params.id)) {
        return res.status(204).end();
    }
    res.status(404).end();
});