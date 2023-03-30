import {Router} from "express";
import {checkRequestRefreshTokenCookieMiddleware} from "../middlewares/check-request-refreshToken-cookie-middleware";
import {securityDevicesController} from "../composition-root";

export const securityDevicesRouter = Router();

securityDevicesRouter.get('/',
    checkRequestRefreshTokenCookieMiddleware,
    securityDevicesController.getAllUserSessions.bind(securityDevicesController)
);

securityDevicesRouter.delete('/', 
    checkRequestRefreshTokenCookieMiddleware,
    securityDevicesController.deleteAllSessionsExceptCurrent.bind(securityDevicesController)
);

securityDevicesRouter.delete('/:deviceId',
    checkRequestRefreshTokenCookieMiddleware,
    securityDevicesController.deleteSessionByDeviceId.bind(securityDevicesController)
);