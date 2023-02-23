
export type sessionType = {
    issuedAt: number,
    expiresDate: number,
    deviceId: string,
    userIp: string,
    userDeviceName: string,
    userId: string
}

export type dataForUpdateSessionType = {
    issuedAt: number,
    expiresDate: number,
    userIp: string,
    userDeviceName: string
}

export type userSessionsDataType = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}