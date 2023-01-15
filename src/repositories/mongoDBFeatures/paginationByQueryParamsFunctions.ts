import {Sort} from "mongodb";
import {client} from "../../db";
import {blogType} from "../../models/blogModels";
import {postType} from "../../models/postModels";
import {queryPaginationType} from "../../models/queryModels";
import {userType} from "../../models/userModels";

const blogsCollection = client.db('ht02DB').collection('blogs');
const postsCollection = client.db('ht02DB').collection('posts');
const usersCollection = client.db('ht02DB').collection('users');
const commentsCollection = client.db('ht02DB').collection('comments');

type resultOfPaginationBlogsByQueryType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogType[]
}

type resultOfPaginationPostsByQueryType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: postType[]
}

type resultOfPaginationUsersByQueryType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: userType[]
}

export type resultOfPaginationCommentsByQueryType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogType[]
}

export type searchTemplate = {
    [field: string]: {$regex: string, $options?: 'i' | 'm' | 'x' | 's'} | string | undefined
}

export type fewSearchTemplates = {
    $and?: searchTemplate[]
    $or?: searchTemplate[]
}

export type queryPaginationTypeWithSearchConfig = {searchConfig: searchTemplate | fewSearchTemplates} & queryPaginationType;

export const paginationBlogsByQueryParams = async (
    {searchConfig, sortBy, sortDirection, pageNumber, pageSize}: queryPaginationTypeWithSearchConfig): Promise<resultOfPaginationBlogsByQueryType> => {
    const howMuchToSkip = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: number;
    if (sortDirection === 'asc') sortDir = 1;
    else sortDir = -1;

    const sortConfig = {[sortBy]: sortDir} as Sort;
    const arrayOfReturnedWithPaginationBlogs = await blogsCollection.find(searchConfig).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false}).toArray();
    const allBlogsFromDB = await blogsCollection.find(searchConfig).toArray();
    const totalCount = allBlogsFromDB.length;
    const pagesCount = Math.ceil(totalCount / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount,
        items: arrayOfReturnedWithPaginationBlogs as any
    }
}

export const paginationPostsByQueryParams = async (
    {searchConfig, sortBy, sortDirection, pageNumber, pageSize}: queryPaginationTypeWithSearchConfig): Promise<resultOfPaginationPostsByQueryType> => {
    const howMuchToSkip = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: number;
    if (sortDirection === 'asc') sortDir = 1;
    else sortDir = -1;

    const sortConfig = {[sortBy]: sortDir} as Sort;
    const arrayOfReturnedWithPaginationPosts = await postsCollection.find(searchConfig).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false}).toArray();
    const allPostsFromDB = await postsCollection.find(searchConfig).toArray();
    const totalCount = allPostsFromDB.length;
    const pagesCount = Math.ceil(totalCount / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount,
        items: arrayOfReturnedWithPaginationPosts as any
    }
}

export const paginationUsersByQueryParams = async (
    {searchConfig, sortBy, sortDirection, pageNumber, pageSize}: queryPaginationTypeWithSearchConfig): Promise<resultOfPaginationUsersByQueryType> => {
    const howMuchToSkip = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: number;
    if (sortDirection === 'asc') sortDir = 1;
    else sortDir = -1;

    const sortConfig = {[sortBy]: sortDir} as Sort;
    const arrayOfReturnedWithPaginationUsers = await usersCollection.find(searchConfig).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false, password: false}).toArray();
    const allUsersFromDB = await usersCollection.find(searchConfig).toArray();
    const totalCount = allUsersFromDB.length;
    const pagesCount = Math.ceil(totalCount / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount,
        items: arrayOfReturnedWithPaginationUsers as any
    }
}

export const paginationCommentsByQueryParams = async (
    {searchConfig, sortBy, sortDirection, pageNumber, pageSize}: queryPaginationTypeWithSearchConfig): Promise<resultOfPaginationCommentsByQueryType> => {
    const howMuchToSkip = (Number(pageNumber) - 1) * Number(pageSize);
    let sortDir: number;
    if (sortDirection === 'asc') sortDir = 1;
    else sortDir = -1;

    const sortConfig = {[sortBy]: sortDir} as Sort;
    const arrayOfReturnedWithPaginationUsers = await commentsCollection.find(searchConfig).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false, postId: false}).toArray();
    const allUsersFromDB = await commentsCollection.find(searchConfig).toArray();
    const totalCount = allUsersFromDB.length;
    const pagesCount = Math.ceil(totalCount / Number(pageSize));
    return {
        pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount,
        items: arrayOfReturnedWithPaginationUsers as any
    }
}