import {body} from "express-validator";
import {authorizationMiddleware} from "../authorizationMiddleware";
import {catchErrorsMiddleware} from "../catchErrorsMiddleware";
import {blogsQueryRepository} from "../../repositories/blogs/blogsQueryRepository";
import {blogIdUriParamCheckMiddleware} from "../blogIdUriParamCheckMiddleware";

const titleFieldValidation = body('title').isString().trim().isLength({max: 30, min: 1});
const shortDescriptionFieldValidation = body('shortDescription').isString().trim().isLength({max: 100, min: 1});
const contentFieldValidation = body('content').isString().trim().isLength({max: 1000, min: 1});
const blogIdFieldValidation = body('blogId').isString().trim().custom(async (value, {req}) => {
    const blogName = await blogsQueryRepository.getBlogByID(req.body.blogId);
    if (!blogName) {
        throw new Error('invalid blog id!');
    }
    return true;
});

export const postsValidationMiddlewaresArray = [authorizationMiddleware, titleFieldValidation, shortDescriptionFieldValidation, contentFieldValidation, blogIdFieldValidation, catchErrorsMiddleware];
export const postsValidationMiddlewaresArrayWithUriBlogIdCheck = [authorizationMiddleware, blogIdUriParamCheckMiddleware, titleFieldValidation, shortDescriptionFieldValidation, contentFieldValidation, catchErrorsMiddleware]