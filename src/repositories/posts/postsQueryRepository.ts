
import {client} from "../../db";
import {postType} from "../../models/postModels";
import {paginationPostsByQueryParams} from "../mongoDBFeatures/paginationByQueryParamsFunctions";
import {queryPaginationType} from "../../models/queryModels";

const postsCollection = client.db('ht02DB').collection('posts');

export const postsQueryRepository = {
    async getPostsWithSortAndPagination({sortBy, sortDirection, pageNumber, pageSize}: queryPaginationType) {
        const queryPaginationTypeWithSearchConfig = {
            searchConfig: {},
            sortBy: sortBy,
            sortDirection: sortDirection,
            pageNumber: pageNumber,
            pageSize: pageSize
        }
        return paginationPostsByQueryParams(queryPaginationTypeWithSearchConfig);
    },
    async getPostByID(id: string): Promise<postType | null> {
        const foundedPost = await postsCollection.findOne({id});
        if (foundedPost) {
            const copyFoundedPost: postType = {
                id: foundedPost.id,
                title: foundedPost.title,
                shortDescription: foundedPost.shortDescription,
                content: foundedPost.content,
                blogId: foundedPost.blogId,
                blogName: foundedPost.blogName,
                createdAt: foundedPost.createdAt
            }
            return copyFoundedPost;
        }
        return null;
    }
}