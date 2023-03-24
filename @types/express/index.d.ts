// сюда нужно что то импортировать иначе работать не будет. не понимаю с чем это связано, пока выясняю.
// допишу причину этого когда узнаю
// импорт нужно писать потому что этот модуль по дефолту изолирован и его вся остальная система не видит
// если добавить любой импорт из системы то он будет с ней связан, расширение интерфейса увидит остальная система и все будет работать
import {AccessTokenPayloadType, RefreshTokenPayloadType} from "../../src/models/token-models";
import {UserTypeExtended} from "../../src/models/user-models";

declare global {
    declare namespace Express {
        export interface Request {
            context: {
                refreshTokenPayload?: RefreshTokenPayloadType,
                accessTokenPayload?: AccessTokenPayloadType,
                userExtended?: UserTypeExtended
            }
        }
    }
}