import {client} from "../../db";

const refreshTokensBlackListCollection = client.db('ht02DB').collection('refreshTokensBlackList');

export const refreshTokensBlackListQueryRepository = {
    // вернет объект {userId: string, expiredRefreshTokens: expiredRefreshTokens[]} или null
    async getBannedRefreshTokensForCurrentUserId(userId: string, refreshToken: string) {
        return refreshTokensBlackListCollection.findOne(
            {
                $and:
                    [
                        {userId},
                        {expiredRefreshTokens: refreshToken}
                    ]
            });
    }
}