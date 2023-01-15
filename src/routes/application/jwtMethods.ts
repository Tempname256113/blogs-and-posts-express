import {Secret, sign, SignOptions, verify} from "jsonwebtoken";
import {userTokenPayloadType} from "../../models/tokenModels";

const JWT_SECRET: string = process.env.JWT_SECRET!;

export const jwtMethods = {
    createNewToken(payload: string | object | Buffer, secretKey: Secret, options: SignOptions | undefined): Promise<string | Error>{
        return new Promise((resolve, reject) => {
            sign(payload, secretKey, (err, token) => {
                if (err) {
                    reject(err);
                }
                resolve(token!);
            })
        })
    },
    compareUserAuthToken(requestToken: string): Promise<userTokenPayloadType | Error>{
        return new Promise((resolve, reject) => {
            requestToken = requestToken.split(' ')[1];
            verify(requestToken, JWT_SECRET, (error, decoded) => {
                if (error) {
                    reject(error);
                }
                const tokenPayload: userTokenPayloadType = decoded as any;
                resolve(tokenPayload);
            })
        })
    }
}