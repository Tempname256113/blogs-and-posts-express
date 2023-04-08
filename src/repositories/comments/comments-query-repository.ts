import {queryPaginationType} from "../../models/query-models";
import {
    paginationCommentsByQueryParams,
    QueryPaginationWithSearchConfigType,
    ResultOfPaginationCommentsByQueryType
} from "../mongo-DB-features/pagination-by-query-params-functions";
import {CommentModel} from "../../mongoose-db-models/comment-db-model";
import {CommentLikeModelType} from "../../models/comment-like-model-type";
import {CommentsLikesModel} from "../../mongoose-db-models/comment-likes-db-model";
import {injectable} from "inversify";
import {HydratedDocument} from "mongoose";
import {CommentInTheDBType, CommentMethodsType} from "../../models/comment-models";

@injectable()
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
    async getCommentByID(id: string): Promise<HydratedDocument<CommentInTheDBType, CommentMethodsType> | null> {
        return CommentModel.findOne({commentId: id}, {_id: false});
    };
    async getLike(userId: string, commentId: string) : Promise <CommentLikeModelType | null> {
        const filter = {$and: [{userId}, {commentId}]};
        return CommentsLikesModel.findOne(filter).lean();
    }
}