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

class BlogsQueryRepository {
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
            searchConfig,
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
        }: { blogId: string } & queryPaginationType): Promise<ResultOfPaginationPostsByQueryType> {
        const queryPaginationWithSearchConfig: QueryPaginationWithSearchConfigType = {
            searchConfig: {blogId},
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }
        return paginationPostsByQueryParams(queryPaginationWithSearchConfig);
    };
    async getBlogByID(id: string): Promise<BlogType | null> {
        return BlogModel.findOne({id}, {_id: false});
    }
}

export const blogsQueryRepository = new BlogsQueryRepository();