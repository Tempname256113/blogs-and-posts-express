
export type accessTokenPayloadType = {
    userId: string,
    iat?: number,
    exp?: number
}

export type refreshTokenPayloadType = {
    userId: string,
    deviceId: string,
    iat?: number,
    exp?: number
}