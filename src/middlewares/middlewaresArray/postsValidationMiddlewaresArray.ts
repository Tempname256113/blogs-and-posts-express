import {body} from "express-validator";
import {blogsRepositoryDB} from "../../repositories/blogsRepositoryDB";
import {authorizationMiddleware} from "../authorizationMiddleware";
import {catchErrorsMiddleware} from "../catchErrorsMiddleware";

const titleFieldValidation = body('title').isString().trim().isLength({max: 30, min: 1});
const shortDescriptionFieldValidation = body('shortDescription').isString().trim().isLength({max: 100, min: 1});
const contentFieldValidation = body('content').isString().trim().isLength({max: 1000, min: 1});
const blogIdFieldValidation = body('blogId').isString().trim().custom(async (value, {req}) => {
    const blogName: Promise<string | null> = await blogsRepositoryDB.findBlogNameByID(req.body.blogId);
    if (blogName === null) {
        throw new Error('invalid blog id!');
    }
    return true;
});

export const postsValidationMiddlewaresArray = [authorizationMiddleware, titleFieldValidation, shortDescriptionFieldValidation, contentFieldValidation, blogIdFieldValidation, catchErrorsMiddleware];