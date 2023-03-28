import {queryPaginationType} from "../../models/query-models";
import {
    paginationCommentsByQueryParams,
    QueryPaginationWithSearchConfigType,
    ResultOfPaginationCommentsByQueryType
} from "../mongo-DB-features/pagination-by-query-params-functions";
import {CommentType} from "../../models/comment-model";
import {CommentModel} from "../../mongoose-db-models/comments-db-model";

class CommentsQueryRepository {
    async getCommentsWithPagination(
        {
            postId,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }: { postId: string } & queryPaginationType): Promise<ResultOfPaginationCommentsByQueryType> {
        const paginationWithSearchConfig: QueryPaginationWithSearchConfigType = {
            searchConfig: {postId},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationCommentsByQueryParams(paginationWithSearchConfig);
    };
    async getCommentByID(id: string): Promise<CommentType | null> {
        return CommentModel.findOne({id}, {_id: false});
    }
}

export const commentsQueryRepository = new CommentsQueryRepository();