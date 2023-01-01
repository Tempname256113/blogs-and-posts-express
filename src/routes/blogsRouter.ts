import {Response, Router} from "express";
import {authorizationMiddleware} from "../middlewares/authorizationMiddleware";
import {
    queryHT04Type,
    RequestWithBody,
    RequestWithQuery, RequestWithURIParamsAndQuery,
    RequestWithURIParams,
    RequestWithURIParamsAndBody
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

export const blogsRouter = Router();

blogsRouter.get('/', async (req: RequestWithQuery<queryHT04Type>, res: Response) => {
    const receivedBlogs = await blogsQueryRepository.getBlogsWithSortAndPaginationQuery(
        req.query.searchNameTerm,
        req.query.sortBy,
        req.query.sortDirection,
        req.query.pageNumber,
        req.query.pageSize
    );
    res.status(200).send(receivedBlogs);
});

blogsRouter.get('/:id', async (req: RequestWithURIParams<{id: string}>, res: Response) => {
    const blog = await blogsQueryRepository.getBlogByID(req.params.id);
    if (blog !== null) {
        res.status(200).send(blog)
    } else {
        res.status(404).end();
    }
});

blogsRouter.get('/:blogId/posts',
    blogIdUriParamCheckMiddleware,
    async (req: RequestWithURIParamsAndQuery<{blogId: string}, queryHT04Type>, res: Response) => {
        const posts = await blogsQueryRepository.getAllPostsForSpecifiedBlog(
            req.params.blogId,
            req.query.pageNumber,
            req.query.pageSize,
            req.query.sortBy,
            req.query.sortDirection
        );
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