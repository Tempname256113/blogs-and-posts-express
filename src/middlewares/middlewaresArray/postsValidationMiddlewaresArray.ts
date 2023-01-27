import {body} from "express-validator";
import {basicAuthorizationCheckMiddleware} from "../basicAuthorizationCheckMiddleware";
import {catchErrorsMiddleware} from "../catchErrorsMiddleware";
import {blogsQueryRepository} from "../../repositories/blogs/blogsQueryRepository";
import {blogIdUriParamCheckMiddleware} from "../blogIdUriParamCheckMiddleware";

const titleFieldValidation = body('title')
    .isString()
    .trim()
    .isLength({max: 30, min: 1});
const shortDescriptionFieldValidation = body('shortDescription')
    .isString()
    .trim()
    .isLength({max: 100, min: 1});
const contentFieldValidation = body('content')
    .isString()
    .trim()
    .isLength({max: 1000, min: 1});
const blogIdFieldValidation = body('blogId')
    .isString()
    .custom(async value => {
    const blog = await blogsQueryRepository.getBlogByID(value);
    if (!blog) return Promise.reject('invalid blog id!');
    return Promise.resolve();
});
// этот middleware проверяет весь приходящий объект в body и так же смотрит правильный blogId или нет
export const postsValidationMiddlewaresArray = [titleFieldValidation, shortDescriptionFieldValidation, contentFieldValidation, blogIdFieldValidation, catchErrorsMiddleware];
export const postsValidationMiddlewaresArrayWithUriBlogIdCheck = [blogIdUriParamCheckMiddleware, titleFieldValidation, shortDescriptionFieldValidation, contentFieldValidation, catchErrorsMiddleware]