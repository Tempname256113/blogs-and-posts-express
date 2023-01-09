
import {client} from "../../db";
import {ObjectId} from "mongodb";
import {blogType} from "../../models/blogModels";
import {
    paginationBlogsByQueryParams,
    paginationPostsByQueryParams, queryPaginationTypeWithSearchConfig,
    searchTemplate
} from "../mongoDBFeatures/paginationByQueryParamsFunctions";
import {queryPaginationType} from "../../models/queryModels";

const blogsCollection = client.db('ht02DB').collection('blogs');

export const blogsQueryRepository = {
    async getBlogsWithSortAndPagination(
        {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize}: {searchNameTerm: string | undefined} & queryPaginationType) {
        let searchConfig: searchTemplate = {};
        if (searchNameTerm) searchConfig = {name: {$regex: searchNameTerm, $options: 'i'}};
        const queryPaginationWithSearchConfig: queryPaginationTypeWithSearchConfig = {
            searchConfig,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationBlogsByQueryParams(queryPaginationWithSearchConfig);
    },
    async getAllPostsForSpecifiedBlog(
        {blogId, sortBy, sortDirection, pageNumber, pageSize}: {blogId: string} & queryPaginationType) {
        const queryPaginationWithSearchConfig: queryPaginationTypeWithSearchConfig = {
            searchConfig: {blogId: blogId},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationPostsByQueryParams(queryPaginationWithSearchConfig);
    },
    async getBlogByID(id: string) {
        const foundedObj = await blogsCollection.findOne({id: id});
        if (foundedObj) {
            const foundedObjCopy: blogType & {_id?: ObjectId} = {
                _id: foundedObj._id,
                id: foundedObj.id,
                name: foundedObj.name,
                description: foundedObj.description,
                websiteUrl: foundedObj.websiteUrl,
                createdAt: foundedObj.createdAt
            };
            delete foundedObjCopy._id;
            return foundedObjCopy;
        }
        return null;
    }
}