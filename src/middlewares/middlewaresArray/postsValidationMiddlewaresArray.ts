import {body} from "express-validator";
import {authorizationCheckMiddleware} from "../authorizationCheckMiddleware";
import {catchErrorsMiddleware} from "../catchErrorsMiddleware";
import {blogsQueryRepository} from "../../repositories/blogs/blogsQueryRepository";
import {blogIdUriParamCheckMiddleware} from "../blogIdUriParamCheckMiddleware";

const titleFieldValidation = body('title').isString().trim().isLength({max: 30, min: 1});
const shortDescriptionFieldValidation = body('shortDescription').isString().trim().isLength({max: 100, min: 1});
const contentFieldValidation = body('content').isString().trim().isLength({max: 1000, min: 1});
const blogIdFieldValidation = body('blogId').isString().custom(async value => {
    const blogName = await blogsQueryRepository.getBlogByID(value);
    if (!blogName) {
        return Promise.reject('invalid blog id!');
    }
    return Promise.resolve();
});

export const postsValidationMiddlewaresArray = [authorizationCheckMiddleware, titleFieldValidation, shortDescriptionFieldValidation, contentFieldValidation, blogIdFieldValidation, catchErrorsMiddleware];
export const postsValidationMiddlewaresArrayWithUriBlogIdCheck = [authorizationCheckMiddleware, blogIdUriParamCheckMiddleware, titleFieldValidation, shortDescriptionFieldValidation, contentFieldValidation, catchErrorsMiddleware]