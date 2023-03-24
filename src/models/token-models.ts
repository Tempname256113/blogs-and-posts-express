
export type AccessTokenPayloadType = {
    userId: string,
    iat?: number,
    exp?: number
}

export type RefreshTokenPayloadType = {
    userId: string,
    deviceId: string,
    iat?: number,
    exp?: number
}