import {body} from "express-validator";
import {usersQueryRepository} from "../../repositories/users/usersQueryRepository";
import {catchErrorsMiddleware} from "../catchErrorsMiddleware";

const passwordValidation = body('password')
    .isString()
    .trim()
    .isLength({min: 6, max: 20});
const loginValidation = body('login')
    .isString()
    .trim()
    .isLength({min: 3, max: 10}).custom(async (value: string) => {
        const findUserByLoginInDB = await usersQueryRepository.getUserByLogin(value);
        if (findUserByLoginInDB) {
            return Promise.reject('login is already exist');
        }
        return Promise.resolve();
    });
const emailValidation = body('email')
    .isString()
    .trim()
    .isLength({min: 1}).isEmail().custom(async (value: string) => {
        const findUserByEmailInDB = await usersQueryRepository.getUserByEmail(value);
        if (findUserByEmailInDB) {
            return Promise.reject('email is already exist');
        }
        return Promise.resolve();
    });

export const createNewUserValidationMiddlewaresArray = [passwordValidation, loginValidation, emailValidation, catchErrorsMiddleware];