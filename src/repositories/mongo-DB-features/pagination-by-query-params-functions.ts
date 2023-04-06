import {BlogType} from "../../models/blog-models";
import {PostInTheDBType} from "../../models/post-models";
import {queryPaginationType} from "../../models/query-models";
import {UserTypeExtended} from "../../models/user-models";
import {BlogModel} from "../../mongoose-db-models/blogs-db-model";
import {SortOrder} from "mongoose";
import {PostModel} from "../../mongoose-db-models/posts-db-model";
import {UserModel} from "../../mongoose-db-models/auth-db-models";
import {CommentDocumentMongooseType, CommentInTheDBType, CommentType} from "../../models/comment-models";
import {CommentModel} from "../../mongoose-db-models/comments-db-model";
import {CommentLikesInfoType} from "../../models/comment-likes-model";

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
    items: PostInTheDBType[]
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
    items: CommentType[]
}

type SearchTemplateType = {
    [field: string]: { $regex: string, $options?: 'i' | 'm' | 'x' | 's' } | string | undefined
}

type FewSearchTemplatesType = {
    $and?: SearchTemplateType[]
    $or?: SearchTemplateType[]
}

type QueryPaginationWithSearchConfigType =
    { searchFilter: SearchTemplateType | FewSearchTemplatesType }
    & queryPaginationType;

const paginationBlogsByQueryParams = async (
    {
        searchFilter,
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
        .find(searchFilter, {_id: false})
        .sort(sortConfig)
        .limit(Number(pageSize))
        .skip(howMuchToSkip);
    const allBlogsFromDB: BlogType[] = await BlogModel.find(searchFilter);
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
        searchFilter,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    }: QueryPaginationWithSearchConfigType): Promise<ResultOfPaginationPostsByQueryType> => {
    const howMuchToSkip: number = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: SortOrder;
    sortDirection === 'asc' ? sortDir = 1 : sortDir = -1;

    const sortConfig = {[sortBy]: sortDir};
    const arrayOfReturnedWithPaginationPosts: PostInTheDBType[] = await PostModel
        .find(searchFilter, {_id: false})
        .sort(sortConfig)
        .limit(Number(pageSize))
        .skip(howMuchToSkip);
    const allPostsFromDB: PostInTheDBType[] = await PostModel.find(searchFilter);
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
        searchFilter,
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
        .find(searchFilter, {_id: false, 'accountData.password': false})
        .sort(sortConfig)
        .limit(Number(pageSize))
        .skip(howMuchToSkip);
    const allUsersFromDB: UserTypeExtended[] = await UserModel.find(searchFilter);
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
        searchFilter,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    }: QueryPaginationWithSearchConfigType, userId: string | null): Promise<ResultOfPaginationCommentsByQueryType> => {
    const howMuchToSkip: number = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: SortOrder;
    sortDirection === 'asc' ? sortDir = 1 : sortDir = -1;

    const sortConfig = {[sortBy]: sortDir};
    const arrayOfReturnedWithPaginationComments: CommentDocumentMongooseType[] = await CommentModel
        .find(searchFilter,
            {_id: false, postId: false},
            {
                sort: sortConfig,
                limit: Number(pageSize),
                skip: howMuchToSkip
            })
    let commentsArray: CommentType[] = [];
    for (const commentFromDB of arrayOfReturnedWithPaginationComments) {
        const commentLikesInfo: CommentLikesInfoType = await commentFromDB.getLikesInfo(userId);
        const compileComment: CommentType = {
            id: commentFromDB.commentId,
            content: commentFromDB.content,
            commentatorInfo: {
                userId: commentFromDB.userId,
                userLogin: commentFromDB.userLogin
            },
            createdAt: commentFromDB.createdAt,
            likesInfo: {
                likesCount: commentLikesInfo.likesCount,
                dislikesCount: commentLikesInfo.dislikesCount,
                myStatus: commentLikesInfo.myLikeStatus
            }
        }
        commentsArray.push(compileComment);
    };
    const allCommentsFromDB: number = await CommentModel.countDocuments(searchFilter);
    const pagesCount: number = Math.ceil(allCommentsFromDB / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount: allCommentsFromDB,
        items: commentsArray
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