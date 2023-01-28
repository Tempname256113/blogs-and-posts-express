import {client} from "../../db";
import {refreshTokensBlackListQueryRepository} from "./refreshTokensBlackListQueryRepository";

const refreshTokensBlackListCollection = client.db('ht02DB').collection('refreshTokensBlackList');

export const refreshTokensBlackListRepository = {
    async addRefreshTokenToBlackList(userId: string, refreshToken: string): Promise<void> {
        const foundedUserById = await refreshTokensBlackListCollection.findOne({userId});
        if (foundedUserById) {
            const foundedUserWithExpiredRefreshTokenInDB = await refreshTokensBlackListQueryRepository.getBannedRefreshTokensForCurrentUserId(userId, refreshToken);
            /* эта проверка нужна чтобы не дублировать забаненные токены в базе данных.
            ищется приходящий токен в базе данных для конкретного юзера чтобы проверить что этого токена еще нет в списке заблокированных*/
            if (foundedUserWithExpiredRefreshTokenInDB) {
                return;
            } else {
                await refreshTokensBlackListCollection.updateOne({userId}, {
                    $set: {
                        expiredRefreshTokens: [...foundedUserById.expiredRefreshTokens, refreshToken]
                    }
                })
            }
        } else {
            await refreshTokensBlackListCollection.insertOne({userId, expiredRefreshTokens: [refreshToken]});
        }
    },
    async deleteAllData(): Promise<void> {
        await refreshTokensBlackListCollection.deleteMany({});
    }
}