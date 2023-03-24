
type SessionType = {
    issuedAt: number,
    expiresDate: number,
    deviceId: string,
    userIp: string,
    userDeviceName: string,
    userId: string
};

type DataForUpdateSessionType = {
    issuedAt: number,
    expiresDate: number,
    userIp: string,
    userDeviceName: string
};

type UserSessionsDataType = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
};

export {SessionType, DataForUpdateSessionType, UserSessionsDataType};