import {Secret, sign, SignOptions, verify, VerifyOptions} from "jsonwebtoken";
import {AccessTokenPayloadType, RefreshTokenPayloadType} from "../../models/token-models";
import {add} from "date-fns";

const JWT_SECRET_REFRESH_TOKEN: string = process.env.JWT_SECRET_REFRESH_TOKEN!;
const JWT_SECRET_ACCESS_TOKEN: string = process.env.JWT_SECRET_ACCESS_TOKEN!;

const createNewToken = (payload: string | object | Buffer, secretKey: Secret, options?: SignOptions): string => {
    if (options) {
        return sign(payload, secretKey, options);
    }
    return sign(payload, secretKey);
}

const compareToken = (requestToken: string, secretKey: Secret, options?: (VerifyOptions & { complete?: false })): AccessTokenPayloadType | RefreshTokenPayloadType | null => {
    const getRequestToken = (): void => {
        if (!requestToken) requestToken = 'none';
        const separatedRequestToken = requestToken.split(' ');
        if (separatedRequestToken.length < 2) {
            requestToken = separatedRequestToken[0];
        } else {
            requestToken = separatedRequestToken[1];
        }
        // если передана строка без Bearer (только токен) то с этой проверкой все будет нормально
    }
    getRequestToken();

    const verifyWithProvidedOptions = (): AccessTokenPayloadType | RefreshTokenPayloadType | null => {
        try {
            return verify(requestToken, secretKey, options) as AccessTokenPayloadType | RefreshTokenPayloadType;
        } catch (err) {
            return null;
        }
    };

    const verifyWithoutProvidedOptions = (): AccessTokenPayloadType | RefreshTokenPayloadType | null => {
        try {
            return verify(requestToken, secretKey) as AccessTokenPayloadType | RefreshTokenPayloadType;
        } catch (err) {
            return null;
        }
    };

    if (options) {
        return verifyWithProvidedOptions();
    } else {
        return verifyWithoutProvidedOptions();
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
        accessToken(requestToken: string, options?: (VerifyOptions & { complete?: false | undefined })): AccessTokenPayloadType | null {
            return compareToken(requestToken, JWT_SECRET_ACCESS_TOKEN, options) as AccessTokenPayloadType | null;
        },
        refreshToken(requestToken: string, options?: (VerifyOptions & { complete?: false | undefined })): RefreshTokenPayloadType | null {
            return compareToken(requestToken, JWT_SECRET_REFRESH_TOKEN, options) as RefreshTokenPayloadType | null;
        },
    }
}

export const createNewPairOfTokens = ({userId, deviceId}: RefreshTokenPayloadType) => {
    const issuedAt: number = Math.floor(new Date().getTime() / 1000);
    const expiresDate: number = Math.floor(add(new Date(), {seconds: 20}).getTime() / 1000); //20s //2years for tests
    const accessToken: string = jwtMethods.createToken.accessToken({userId}, {expiresIn: '10s'}); //10s //2years for tests
    const refreshToken: string = jwtMethods.createToken.refreshToken({userId, deviceId, iat: issuedAt, exp: expiresDate});
    return {
        accessToken,
        refreshToken: {
            refreshToken,
            issuedAt,
            expiresDate
        }
    }
}