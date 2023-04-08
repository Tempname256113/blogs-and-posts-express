import {BlogType} from "../../models/blog-models";
import {PostInTheDBType, PostMethodsType, PostType} from "../../models/post-models";
import {queryPaginationType} from "../../models/query-models";
import {UserTypeExtended} from "../../models/user-models";
import {BlogModel} from "../../mongoose-db-models/blogs-db-model";
import {HydratedDocument, SortOrder} from "mongoose";
import {PostModel} from "../../mongoose-db-models/post-db-model";
import {UserModel} from "../../mongoose-db-models/auth-db-models";
import {CommentInTheDBType, CommentMethodsType, CommentType} from "../../models/comment-models";
import {CommentModel} from "../../mongoose-db-models/comment-db-model";
import {CommentLikeInfoType} from "../../models/comment-like-model-type";
import {PostExtendedLikesInfoType, PostLikeModelType} from "../../models/post-likes-models";

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
    }: QueryPaginationWithSearchConfigType, userId: string | null): Promise<ResultOfPaginationPostsByQueryType> => {
    const howMuchToSkip: number = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: SortOrder;
    sortDirection === 'asc' ? sortDir = 1 : sortDir = -1;

    const sortConfig = {[sortBy]: sortDir};
    const findOptions = {
        sort: sortConfig,
        limit: Number(pageSize),
        skip: howMuchToSkip
    };
    const arrayOfReturnedWithPaginationPosts: HydratedDocument<PostInTheDBType, PostMethodsType>[] = await PostModel
        .find(searchFilter, {_id: false}, findOptions);
    const allPostsFromDB: number = await PostModel.countDocuments(searchFilter);
    const pagesCount: number = Math.ceil(allPostsFromDB / Number(pageSize));
    const arrayOfPosts: PostType[] = [];
    for (const postFromDB of arrayOfReturnedWithPaginationPosts) {
        const postLikesInfo: PostExtendedLikesInfoType = await postFromDB.getLikesInfo(userId);
        const compilePost: PostType = {
            id: postFromDB.id,
            title: postFromDB.title,
            shortDescription: postFromDB.shortDescription,
            content: postFromDB.content,
            blogName: postFromDB.blogName,
            blogId: postFromDB.blogId,
            createdAt: postFromDB.createdAt,
            extendedLikesInfo: {
                likesCount: postLikesInfo.likesCount,
                dislikesCount: postLikesInfo.dislikesCount,
                myLikeStatus: postLikesInfo.myLikeStatus,
                newestLikes: postLikesInfo.newestLikes
            }
        };
        arrayOfPosts.push(compilePost);
    }
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount: allPostsFromDB,
        items: arrayOfPosts
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
    const findOptions = {
        sort: sortConfig,
        limit: Number(pageSize),
        skip: howMuchToSkip
    };
    const arrayOfReturnedWithPaginationComments: HydratedDocument<CommentInTheDBType, CommentMethodsType>[] = await CommentModel
        .find(searchFilter, {_id: false, postId: false}, findOptions);
    const allCommentsFromDB: number = await CommentModel.countDocuments(searchFilter);
    const pagesCount: number = Math.ceil(allCommentsFromDB / Number(pageSize));
    const commentsArray: CommentType[] = [];
    for (const commentFromDB of arrayOfReturnedWithPaginationComments) {
        const commentLikesInfo: CommentLikeInfoType = await commentFromDB.getLikesInfo(userId);
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