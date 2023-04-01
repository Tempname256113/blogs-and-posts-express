import {BlogType} from "../../models/blog-models";
import {PostType} from "../../models/post-models";
import {queryPaginationType} from "../../models/query-models";
import {UserTypeExtended} from "../../models/user-models";
import {BlogModel} from "../../mongoose-db-models/blogs-db-model";
import {SortOrder} from "mongoose";
import {PostModel} from "../../mongoose-db-models/posts-db-model";
import {UserModel} from "../../mongoose-db-models/auth-db-models";
import {CommentInTheDBType} from "../../models/comment-models";
import {CommentModel} from "../../mongoose-db-models/comments-db-model";

type ResultOfPaginationBlogsByQueryType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BlogType[]
}

type ResultOfPaginationPostsByQueryType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostType[]
}

type ResultOfPaginationUsersByQueryType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: UserTypeExtended[]
}

type ResultOfPaginationCommentsByQueryType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: CommentInTheDBType[]
}

type SearchTemplateType = {
    [field: string]: { $regex: string, $options?: 'i' | 'm' | 'x' | 's' } | string | undefined
}

type FewSearchTemplatesType = {
    $and?: SearchTemplateType[]
    $or?: SearchTemplateType[]
}

type QueryPaginationWithSearchConfigType =
    { searchConfig: SearchTemplateType | FewSearchTemplatesType }
    & queryPaginationType;

const paginationBlogsByQueryParams = async (
    {
        searchConfig,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    }: QueryPaginationWithSearchConfigType): Promise<ResultOfPaginationBlogsByQueryType> => {
    const howMuchToSkip: number = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: SortOrder;
    sortDirection === 'asc' ? sortDir = 1 : sortDir = -1;

    const sortConfig = {[sortBy]: sortDir};
    const arrayOfReturnedWithPaginationBlogs: BlogType[] = await BlogModel
        .find(searchConfig, {_id: false})
        .sort(sortConfig)
        .limit(Number(pageSize))
        .skip(howMuchToSkip);
    const allBlogsFromDB: BlogType[] = await BlogModel.find(searchConfig);
    const totalCount: number = allBlogsFromDB.length;
    const pagesCount: number = Math.ceil(totalCount / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount,
        items: arrayOfReturnedWithPaginationBlogs
    }
}

const paginationPostsByQueryParams = async (
    {
        searchConfig,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    }: QueryPaginationWithSearchConfigType): Promise<ResultOfPaginationPostsByQueryType> => {
    const howMuchToSkip: number = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: SortOrder;
    sortDirection === 'asc' ? sortDir = 1 : sortDir = -1;

    const sortConfig = {[sortBy]: sortDir};
    const arrayOfReturnedWithPaginationPosts: PostType[] = await PostModel
        .find(searchConfig, {_id: false})
        .sort(sortConfig)
        .limit(Number(pageSize))
        .skip(howMuchToSkip);
    const allPostsFromDB: PostType[] = await PostModel.find(searchConfig);
    const totalCount: number = allPostsFromDB.length;
    const pagesCount: number = Math.ceil(totalCount / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount,
        items: arrayOfReturnedWithPaginationPosts
    }
}

const paginationUsersByQueryParams = async (
    {
        searchConfig,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    }: QueryPaginationWithSearchConfigType): Promise<ResultOfPaginationUsersByQueryType> => {
    const howMuchToSkip: number = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: SortOrder;
    sortDirection === 'asc' ? sortDir = 1 : sortDir = -1;

    const sortConfig = {[sortBy]: sortDir};
    const arrayOfReturnedWithPaginationUsers: UserTypeExtended[] = await UserModel
        .find(searchConfig, {_id: false, 'accountData.password': false})
        .sort(sortConfig)
        .limit(Number(pageSize))
        .skip(howMuchToSkip);
    const allUsersFromDB: UserTypeExtended[] = await UserModel.find(searchConfig);
    const totalCount: number = allUsersFromDB.length;
    const pagesCount: number = Math.ceil(totalCount / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount,
        items: arrayOfReturnedWithPaginationUsers
    }
}

const paginationCommentsByQueryParams = async (
    {
        searchConfig,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    }: QueryPaginationWithSearchConfigType): Promise<ResultOfPaginationCommentsByQueryType> => {
    const howMuchToSkip: number = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: SortOrder;
    sortDirection === 'asc' ? sortDir = 1 : sortDir = -1;

    const sortConfig = {[sortBy]: sortDir};
    const arrayOfReturnedWithPaginationComments: CommentInTheDBType[] = await CommentModel
        .find(searchConfig, {_id: false, postId: false})
        .sort(sortConfig)
        .limit(Number(pageSize))
        .skip(howMuchToSkip);
    const allCommentsFromDB: CommentInTheDBType[] = await CommentModel.find(searchConfig);
    const totalCount: number = allCommentsFromDB.length;
    const pagesCount: number = Math.ceil(totalCount / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount,
        items: arrayOfReturnedWithPaginationComments
    }
}

export {
    ResultOfPaginationCommentsByQueryType,
    ResultOfPaginationPostsByQueryType,
    ResultOfPaginationBlogsByQueryType,
    ResultOfPaginationUsersByQueryType,
    SearchTemplateType,
    FewSearchTemplatesType,
    QueryPaginationWithSearchConfigType,
    paginationBlogsByQueryParams,
    paginationPostsByQueryParams,
    paginationUsersByQueryParams,
    paginationCommentsByQueryParams
}