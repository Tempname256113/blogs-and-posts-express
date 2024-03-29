import {body} from "express-validator";
import {catchErrorsMiddleware} from "../catch-errors-middleware";

const nameFieldValidation = body('name')
    .isString()
    .trim()
    .isLength({max: 15, min: 1});
const descriptionFieldValidation = body('description',)
    .isString()
    .trim()
    .isLength({max: 500, min: 1});
const websiteUrlFieldValidation = body('websiteUrl',)
    .isString()
    .trim()
    .isLength({max: 100, min: 1})
    .matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$');

export const blogsValidationMiddlewaresArray = [nameFieldValidation, descriptionFieldValidation, websiteUrlFieldValidation, catchErrorsMiddleware];