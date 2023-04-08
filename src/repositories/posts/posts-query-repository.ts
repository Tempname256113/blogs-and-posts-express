import {PostInTheDBType, PostMethodsType} from "../../models/post-models";
import {
    paginationPostsByQueryParams,
    ResultOfPaginationPostsByQueryType
} from "../mongo-DB-features/pagination-by-query-params-functions";
import {queryPaginationType} from "../../models/query-models";
import {PostModel} from "../../mongoose-db-models/post-db-model";
import {injectable} from "inversify";
import {HydratedDocument} from "mongoose";
import {PostLikeModelType} from "../../models/post-likes-models";
import {PostLikesModel} from "../../mongoose-db-models/post-likes-db-model";

@injectable()
export class PostsQueryRepository {
    async getPostsWithSortAndPagination(
        {
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }: queryPaginationType, userId: string | null): Promise<ResultOfPaginationPostsByQueryType> {
        const queryPaginationTypeWithSearchConfig = {
            searchFilter: {},
            sortBy: sortBy,
            sortDirection: sortDirection,
            pageNumber: pageNumber,
            pageSize: pageSize
        }
        return paginationPostsByQueryParams(queryPaginationTypeWithSearchConfig, userId);
    };
    async getPostByID(id: string): Promise<HydratedDocument<PostInTheDBType, PostMethodsType> | null> {
        return PostModel.findOne({id}, {_id: false});
    };
    async getLike(userId: string, postId: string) : Promise <PostLikeModelType | null> {
        const filter = {$and: [{userId}, {postId}]};
        return PostLikesModel.findOne(filter).lean();
    }
}