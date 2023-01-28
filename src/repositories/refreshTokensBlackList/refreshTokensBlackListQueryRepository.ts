import {client} from "../../db";

const refreshTokensBlackListCollection = client.db('ht02DB').collection('refreshTokensBlackList');

export const refreshTokensBlackListQueryRepository = {
    getBannedRefreshToken(refreshToken: string) {
        return refreshTokensBlackListCollection.findOne({refreshToken});
    }
}