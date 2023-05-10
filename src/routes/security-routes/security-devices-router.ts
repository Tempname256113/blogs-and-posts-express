import {Router} from "express";
import {checkRequestRefreshTokenCookieMiddleware} from "../../middlewares/check-request-refreshToken-cookie-middleware";
import {container} from "../../composition-root";
import {SecurityDevicesController} from "./security-devices-controller";

// const securityDevicesController = iocContainer.getInstance<SecurityDevicesController>(SecurityDevicesController);
const securityDevicesController = container.resolve(SecurityDevicesController);

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