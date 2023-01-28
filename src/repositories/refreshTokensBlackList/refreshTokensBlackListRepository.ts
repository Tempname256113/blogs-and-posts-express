import {client} from "../../db";
import {refreshTokensBlackListQueryRepository} from "./refreshTokensBlackListQueryRepository";

const refreshTokensBlackListCollection = client.db('ht02DB').collection('refreshTokensBlackList');

export const refreshTokensBlackListRepository = {
    async addRefreshTokenToBlackList(refreshToken: string): Promise<void> {
        const foundedRefreshTokenFromBlackList = await refreshTokensBlackListQueryRepository.getBannedRefreshToken(refreshToken);
        if (!foundedRefreshTokenFromBlackList) {
            await refreshTokensBlackListCollection.insertOne({refreshToken});
        }
    },
    async deleteAllData(): Promise<void> {
        await refreshTokensBlackListCollection.deleteMany({});
    }
}