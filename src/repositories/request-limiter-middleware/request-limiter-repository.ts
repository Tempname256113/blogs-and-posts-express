import {client} from "../../db";
import {BannedIpAddressType, RequestLimiterDataType} from "../../middlewares/request-limiter-middleware";

const db = client.db('ht02DB');
const requestLimiterCollection = db.collection<RequestLimiterDataType>('request-limiter-data');
const bannedIpAddressesCollection = db.collection<BannedIpAddressType>('request-limiter-banned-addresses');

export const requestLimiterRepository = {
    async addRequestData(reqData: RequestLimiterDataType): Promise<void> {
        await requestLimiterCollection.insertOne(reqData);
    },
    async banIpAddress(data: BannedIpAddressType): Promise<void> {
        await bannedIpAddressesCollection.insertOne(data);
    },
    async getRequestDataQuantity({ip, routeUrl, timestamp}: RequestLimiterDataType): Promise<number> {
        const filter = {
            $and: [
                {ip},
                {routeUrl},
                {timestamp: {$gte: timestamp}}
            ]
        };
        const foundedData = await requestLimiterCollection.find(filter).toArray();
        console.log(foundedData);
        return foundedData.length;
    },
    async findBannedIpAddress(data: BannedIpAddressType): Promise<boolean> {
        const foundedBannedIpAddress: null | BannedIpAddressType = await bannedIpAddressesCollection.findOne(data);
        return foundedBannedIpAddress ? true : false;
    },
    async deleteAllIpAddresses(): Promise<void> {
        await requestLimiterCollection.deleteMany({});
        await bannedIpAddressesCollection.deleteMany({});
    }
}