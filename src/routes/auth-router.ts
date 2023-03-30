import {body} from "express-validator";
import {catchErrorsMiddleware} from "../middlewares/catch-errors-middleware";
import {Router} from "express";
import {usersQueryRepository} from "../repositories/users/users-query-repository";
import {bearerUserAuthTokenCheckMiddleware} from "../middlewares/bearer-user-auth-token-check-middleware";
import {
    createNewUserValidationMiddlewaresArray
} from "../middlewares/middlewares-arrays/create-new-user-validation-middlewares-array";
import {checkRequestRefreshTokenCookieMiddleware} from "../middlewares/check-request-refreshToken-cookie-middleware";
import {requestLimiterMiddleware} from "../middlewares/request-limiter-middleware";
import {authController} from "../composition-root";

export const authRouter = Router();

authRouter.post('/login',
    requestLimiterMiddleware,
    body('loginOrEmail').isString().trim().isLength({min: 1}),
    body('password').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    authController.login.bind(authController)
);

authRouter.post('/refresh-token',
    checkRequestRefreshTokenCookieMiddleware,
    authController.getNewPairOfTokens.bind(authController)
);

authRouter.post('/logout',
    checkRequestRefreshTokenCookieMiddleware,
    authController.logout.bind(authController)
);

authRouter.get('/me',
    bearerUserAuthTokenCheckMiddleware,
    authController.getInfoAboutMe.bind(authController)
);

authRouter.post('/registration',
    requestLimiterMiddleware,
    createNewUserValidationMiddlewaresArray,
    authController.registrationNewUser.bind(authController)
);

authRouter.post('/registration-confirmation',
    requestLimiterMiddleware,
    body('code').isString().trim().isLength({min: 1}),
    catchErrorsMiddleware,
    authController.registrationConfirm.bind(authController)
);

authRouter.post('/registration-email-resending',
    requestLimiterMiddleware,
    body('email').isEmail(),
    catchErrorsMiddleware,
    authController.registrationEmailCodeResending.bind(authController)
);

authRouter.post('/password-recovery',
    requestLimiterMiddleware,
    body('email').isEmail(),
    catchErrorsMiddleware,
    authController.sendPasswordRecoveryCode.bind(authController)
);

authRouter.post('/new-password',
    requestLimiterMiddleware,
    body('newPassword').isString().trim().isLength({min: 6, max: 20}),
    body('recoveryCode').isString().trim().isLength({min: 1}).custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            // поиск пользователя в базе данных по приходящему коду для восстановления пароля
            // если не находит то говорит об ошибке
            usersQueryRepository.getUserByPasswordRecoveryCode(value).then(foundedUserByRecoveryCode => {
                if (foundedUserByRecoveryCode === null) {
                    reject('Recovery code is incorrect or expired');
                } else {
                    req.context = {userExtended: foundedUserByRecoveryCode};
                    resolve('');
                }
            })
        });
    }),
    catchErrorsMiddleware,
    authController.createNewUserPassword.bind(authController)
);