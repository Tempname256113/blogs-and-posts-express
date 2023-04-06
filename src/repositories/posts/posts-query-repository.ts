import {PostInTheDBType} from "../../models/post-models";
import {
    paginationPostsByQueryParams,
    ResultOfPaginationPostsByQueryType
} from "../mongo-DB-features/pagination-by-query-params-functions";
import {queryPaginationType} from "../../models/query-models";
import {PostModel} from "../../mongoose-db-models/posts-db-model";
import {injectable} from "inversify";

@injectable()
export class PostsQueryRepository {
    async getPostsWithSortAndPagination(
        {
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }: queryPaginationType): Promise<ResultOfPaginationPostsByQueryType> {
        const queryPaginationTypeWithSearchConfig = {
            searchFilter: {},
            sortBy: sortBy,
            sortDirection: sortDirection,
            pageNumber: pageNumber,
            pageSize: pageSize
        }
        return paginationPostsByQueryParams(queryPaginationTypeWithSearchConfig);
    };
    async getPostByID(id: string): Promise<PostInTheDBType | null> {
        return PostModel.findOne({id}, {_id: false});
    }
}