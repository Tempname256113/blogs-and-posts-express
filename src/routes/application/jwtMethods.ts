import {Secret, sign, SignOptions, verify, VerifyOptions} from "jsonwebtoken";
import {accessTokenPayloadType, refreshTokenPayloadType} from "../../models/tokenModels";

const JWT_SECRET_REFRESH_TOKEN: string = process.env.JWT_SECRET_REFRESH_TOKEN!;
const JWT_SECRET_ACCESS_TOKEN: string = process.env.JWT_SECRET_ACCESS_TOKEN!;

const createNewToken = (payload: string | object | Buffer, secretKey: Secret, options?: SignOptions): string => {
    if (options) {
        return sign(payload, secretKey, options);
    }
    return sign(payload, secretKey);
}

const compareToken = (requestToken: string, secretKey: Secret, options?: (VerifyOptions & { complete?: false })) => {
    requestToken = requestToken.split(' ')[1];
    // если передана строка без Bearer (только токен) то с этой проверкой все будет нормально
    if (!requestToken) {
        requestToken = requestToken[0];
    }
    if (options) {
        try {
            return verify(requestToken, JWT_SECRET_ACCESS_TOKEN, options) as accessTokenPayloadType | refreshTokenPayloadType;
        } catch (err) {
            return null;
        }
    } else {
        try {
            return verify(requestToken, JWT_SECRET_ACCESS_TOKEN) as accessTokenPayloadType | refreshTokenPayloadType;
        } catch (err) {
            return null;
        }
    }
}

export const jwtMethods = {
    createToken: {
        accessToken(payload: string | object | Buffer, options?: SignOptions): string {
            return createNewToken(payload, JWT_SECRET_ACCESS_TOKEN, options,);
        },
        refreshToken(payload: string | object | Buffer, options?: SignOptions): string {
            return createNewToken(payload, JWT_SECRET_REFRESH_TOKEN, options);
        },
    },
    compareToken: {
        accessToken(requestToken: string, options?: (VerifyOptions & { complete?: false | undefined })): accessTokenPayloadType | null {
            return compareToken(requestToken, JWT_SECRET_ACCESS_TOKEN, options) as accessTokenPayloadType | null;
        },
        refreshToken(requestToken: string, options?: (VerifyOptions & { complete?: false | undefined })): refreshTokenPayloadType | null {
            return compareToken(requestToken, JWT_SECRET_REFRESH_TOKEN, options) as refreshTokenPayloadType | null;
        },
    }
}