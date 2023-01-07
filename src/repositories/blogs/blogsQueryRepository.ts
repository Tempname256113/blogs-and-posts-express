
import {client} from "../../db";
import {ObjectId} from "mongodb";
import {blogType} from "../../models/blogModels";
import {
    paginationBlogsByQueryParams,
    paginationPostsByQueryParams,
    searchTemplate
} from "../mongoDBFeatures/paginationByQueryParamsFunctions";
import {queryPaginationType} from "../../models/queryModels";

const blogsCollection = client.db('ht02DB').collection('blogs');

export const blogsQueryRepository = {
    async getBlogsWithSortAndPagination(
        paginationConfig: {searchNameTerm: string | undefined} & queryPaginationType) {
        let searchConfig: searchTemplate = {};
        if (paginationConfig.searchNameTerm) searchConfig = {name: {$regex: paginationConfig.searchNameTerm, $options: 'i'}};
        return paginationBlogsByQueryParams(
            {
                searchConfig: searchConfig,
                sortBy: paginationConfig.sortBy,
                sortDirection: paginationConfig.sortDirection,
                pageNumber: paginationConfig.pageNumber,
                pageSize: paginationConfig.pageSize
            }
        )
    },
    async getAllPostsForSpecifiedBlog(
        paginationConfig: {blogId: string} & queryPaginationType) {
        return paginationPostsByQueryParams(
            {
            searchConfig: {blogId: paginationConfig.blogId},
            sortBy: paginationConfig.sortBy,
            sortDirection: paginationConfig.sortDirection,
            pageNumber: paginationConfig.pageNumber,
            pageSize: paginationConfig.pageSize
            }
        )
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