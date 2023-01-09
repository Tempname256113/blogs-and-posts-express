import {body} from "express-validator";
import {authorizationCheckMiddleware} from "../authorizationCheckMiddleware";
import {catchErrorsMiddleware} from "../catchErrorsMiddleware";

const nameFieldValidation = body('name').isString().trim().isLength({max: 15, min: 1});
const descriptionFieldValidation = body('description',).isString().trim().isLength({max: 500, min: 1});
const websiteUrlFieldValidation = body('websiteUrl',).isString().trim().isLength({max: 100, min: 1}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$');

export const blogsValidationMiddlewaresArray = [authorizationCheckMiddleware, nameFieldValidation, descriptionFieldValidation, websiteUrlFieldValidation, catchErrorsMiddleware];