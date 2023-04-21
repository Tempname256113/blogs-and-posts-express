import {Router} from "express";
import {basicAuthorizationCheckMiddleware} from "../../middlewares/basic-authorization-check-middleware";
import {blogsValidationMiddlewaresArray} from "../../middlewares/middlewares-arrays/blogs-validation-middlewares-array";
import {blogIdUriParamCheckMiddleware} from "../../middlewares/blogId-uri-param-check-middleware";
import {
    postsValidationMiddlewaresArrayWithUriBlogIdCheck
} from "../../middlewares/middlewares-arrays/posts-validation-middlewares-array";
import {container} from "../../composition-root";
import {BlogsController} from "./blogs-controller";

// const blogsController = iocContainer.getInstance<BlogsController>(BlogsController);
const blogsController = container.resolve(BlogsController);

export const blogsRouter = Router();

blogsRouter.get('/', blogsController.getAllBlogsWithSortAndPagination.bind(blogsController));

blogsRouter.get('/:id', blogsController.getBlogById.bind(blogsController));

blogsRouter.get('/:blogId/posts',
    blogIdUriParamCheckMiddleware,
    blogsController.getAllPostsByBlogId.bind(blogsController)
);

blogsRouter.post('/',
    basicAuthorizationCheckMiddleware,
    blogsValidationMiddlewaresArray,
    blogsController.createNewBlog.bind(blogsController)
);

blogsRouter.post('/:blogId/posts',
    basicAuthorizationCheckMiddleware,
    postsValidationMiddlewaresArrayWithUriBlogIdCheck,
    blogsController.createNewPostByBlogId.bind(blogsController)
);

blogsRouter.put('/:id',
    basicAuthorizationCheckMiddleware,
    blogsValidationMiddlewaresArray,
    blogsController.updateBlogById.bind(blogsController)
);

blogsRouter.delete('/:id',
    basicAuthorizationCheckMiddleware,
    blogsController.deleteBlogById.bind(blogsController)
);