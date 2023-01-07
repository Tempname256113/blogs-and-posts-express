
import {client} from "../../db";
import {ObjectId} from "mongodb";
import {postType} from "../../models/postModels";
import {paginationPostsByQueryParams} from "../mongoDBFeatures/paginationByQueryParamsFunctions";
import {queryPaginationType} from "../../models/queryModels";

const postsCollection = client.db('ht02DB').collection('posts');

export const postsQueryRepository = {
    async getPostsWithSortAndPagination(paginationConfig: queryPaginationType) {
        return paginationPostsByQueryParams(
            {
                searchConfig: {},
                sortBy: paginationConfig.sortBy,
                sortDirection: paginationConfig.sortDirection,
                pageNumber: paginationConfig.pageNumber,
                pageSize: paginationConfig.pageSize
            }
        )
    },
    async getPostByID(id: string): Promise<postType & {_id?: ObjectId} | null> {
        const foundedPost = await postsCollection.findOne({id: id});
        if (foundedPost) {
            const copyFoundedPost: postType & {_id?: ObjectId} = {
                _id: foundedPost._id,
                id: foundedPost.id,
                title: foundedPost.title,
                shortDescription: foundedPost.shortDescription,
                content: foundedPost.content,
                blogId: foundedPost.blogId,
                blogName: foundedPost.blogName,
                createdAt: foundedPost.createdAt
            }
            delete copyFoundedPost._id;
            return copyFoundedPost;
        }
        return null;
    }
}