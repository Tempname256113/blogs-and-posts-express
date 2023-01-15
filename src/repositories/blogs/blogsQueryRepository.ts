
import {client} from "../../db";
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
            searchConfig: {blogId},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationPostsByQueryParams(queryPaginationWithSearchConfig);
    },
    async getBlogByID(id: string) {
        const foundedBlog = await blogsCollection.findOne({id});
        if (foundedBlog) {
            const foundedBlogCopy: blogType = {
                id: foundedBlog.id,
                name: foundedBlog.name,
                description: foundedBlog.description,
                websiteUrl: foundedBlog.websiteUrl,
                createdAt: foundedBlog.createdAt
            };
            return foundedBlogCopy;
        }
        return null;
    }
}