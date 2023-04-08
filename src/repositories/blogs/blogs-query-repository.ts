import 'reflect-metadata';
import {BlogType} from "../../models/blog-models";
import {
    paginationBlogsByQueryParams,
    paginationPostsByQueryParams,
    QueryPaginationWithSearchConfigType,
    ResultOfPaginationBlogsByQueryType,
    ResultOfPaginationPostsByQueryType,
    SearchTemplateType
} from "../mongo-DB-features/pagination-by-query-params-functions";
import {queryPaginationType} from "../../models/query-models";
import {BlogModel} from "../../mongoose-db-models/blogs-db-model";
import {injectable} from "inversify";

@injectable()
export class BlogsQueryRepository {
    async getBlogsWithSortAndPagination(
        {
            searchNameTerm,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }: { searchNameTerm: string | undefined } & queryPaginationType): Promise<ResultOfPaginationBlogsByQueryType> {
        let searchConfig: SearchTemplateType = {};
        if (searchNameTerm) searchConfig = {name: {$regex: searchNameTerm, $options: 'i'}};
        const queryPaginationWithSearchConfig: QueryPaginationWithSearchConfigType = {
            searchFilter: searchConfig,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationBlogsByQueryParams(queryPaginationWithSearchConfig);
    };
    async getAllPostsForSpecifiedBlog(
        {
            blogId,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }: { blogId: string } & queryPaginationType, userId: string | null): Promise<ResultOfPaginationPostsByQueryType> {
        const queryPaginationWithSearchConfig: QueryPaginationWithSearchConfigType = {
            searchFilter: {blogId},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationPostsByQueryParams(queryPaginationWithSearchConfig, userId);
    };
    async getBlogByID(id: string): Promise<BlogType | null> {
        return BlogModel.findOne({id}, {_id: false});
    }
}