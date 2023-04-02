import {queryPaginationType} from "../../models/query-models";
import {
    paginationCommentsByQueryParams,
    QueryPaginationWithSearchConfigType,
    ResultOfPaginationCommentsByQueryType
} from "../mongo-DB-features/pagination-by-query-params-functions";
import {
    CommentDocumentMongooseType,
} from "../../models/comment-models";
import {CommentModel} from "../../mongoose-db-models/comments-db-model";

export class CommentsQueryRepository {
    async getCommentsWithPagination(
        {
            postId,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            userId
        }: { postId: string, userId: string | null } & queryPaginationType): Promise<ResultOfPaginationCommentsByQueryType> {
        const paginationWithSearchConfig: QueryPaginationWithSearchConfigType = {
            searchFilter: {postId},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationCommentsByQueryParams(paginationWithSearchConfig, userId);
    };
    async getCommentByID(id: string): Promise<CommentDocumentMongooseType | null> {
        return CommentModel.findOne({commentId: id}, {_id: false});
    }
}

export const commentsQueryRepository = new CommentsQueryRepository();