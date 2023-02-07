import {queryPaginationType} from "../../models/query-models";
import {
    paginationCommentsByQueryParams,
    queryPaginationTypeWithSearchConfig
} from "../mongoDBFeatures/pagination-by-query-params-functions";
import {client} from "../../db";
import {commentType} from "../../models/comment-model";

const commentsCollection = client.db('ht02DB').collection('comments');

export const commentsQueryRepository = {
    async getCommentsWithPagination({postId, sortBy, sortDirection, pageNumber, pageSize}: {postId: string} & queryPaginationType){
        const paginationWithSearchConfig: queryPaginationTypeWithSearchConfig = {
            searchConfig: {postId},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationCommentsByQueryParams(paginationWithSearchConfig);
    },
    async getCommentByID(id: string): Promise<commentType | null>{
        const foundedComment = await commentsCollection.findOne({id});
        if (foundedComment) {
            const comment: commentType = {
                id: foundedComment.id,
                content: foundedComment.content,
                userId: foundedComment.userId,
                userLogin: foundedComment.userLogin,
                createdAt: foundedComment.createdAt
            }
            return comment;
        }
        return null;
    }
}