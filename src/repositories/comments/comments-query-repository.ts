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
    async getCommentByID(id: string): Promise<CommentDocumentMongooseType | null> {
        return CommentModel.findOne({commentId: id}, {_id: false});
    }
}

export const commentsQueryRepository = new CommentsQueryRepository();