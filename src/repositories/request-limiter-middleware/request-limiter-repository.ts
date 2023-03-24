import {RequestLimiterDataType} from "../../middlewares/request-limiter-middleware";
import {model, Schema} from "mongoose";

const requestLimiterSchema = new Schema<RequestLimiterDataType>(
    {
        ip: String,
        routeUrl: String,
        time: Date
    }, {strict: true, versionKey: false, collection: 'request-limiter-data'}
);

const RequestLimiterModel = model<RequestLimiterDataType>('request-limiter-data', requestLimiterSchema);

export const requestLimiterRepository = {
    async addRequestData(reqData: RequestLimiterDataType): Promise<void> {
        await new RequestLimiterModel(reqData).save();
    },
    async checkCountOfRequests(data: RequestLimiterDataType): Promise<number> {
        const countOfRequests: number  = await RequestLimiterModel.countDocuments({
            ip: data.ip,
            routeUrl: data.routeUrl,
            time: {$gt: data.time}
        });
        return countOfRequests;
    },
    async deleteAllIpAddresses(): Promise<void> {
        await RequestLimiterModel.deleteMany();
    }
}