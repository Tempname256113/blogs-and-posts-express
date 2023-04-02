import {PostType} from "../../models/post-models";
import {
    paginationPostsByQueryParams,
    ResultOfPaginationPostsByQueryType
} from "../mongo-DB-features/pagination-by-query-params-functions";
import {queryPaginationType} from "../../models/query-models";
import {PostModel} from "../../mongoose-db-models/posts-db-model";

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
    async getPostByID(id: string): Promise<PostType | null> {
        return PostModel.findOne({id}, {_id: false});
    }
}

export const postsQueryRepository = new PostsQueryRepository();