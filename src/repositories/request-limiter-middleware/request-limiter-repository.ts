import {client} from "../../db";
import {BannedIpAddressType, RequestLimiterDataType} from "../../middlewares/request-limiter-middleware";

const db = client.db('ht02DB');
const requestLimiterCollection = db.collection<RequestLimiterDataType>('request-limiter-data');

export const requestLimiterRepository = {
    async addRequestData(reqData: RequestLimiterDataType): Promise<void> {
        await requestLimiterCollection.insertOne(reqData);
    },
    async findBannedIpAddress(data: BannedIpAddressType): Promise<number> {
        const foundedBannedIpAddress: number  = await requestLimiterCollection.countDocuments({
            ip: data.ip,
            routeUrl: data.routeUrl,
            time: {$gt: data.time}
        });
        return foundedBannedIpAddress;
    },
    async deleteAllIpAddresses(): Promise<void> {
        await requestLimiterCollection.deleteMany({});
    }
}