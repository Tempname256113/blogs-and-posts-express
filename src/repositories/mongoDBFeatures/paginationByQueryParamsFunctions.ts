import {Sort} from "mongodb";
import {client} from "../../db";
import {blogType} from "../../models/blogModels";
import {postType} from "../../models/postModels";
import {queryPaginationType} from "../../models/queryModels";

const blogsCollection = client.db('ht02DB').collection('blogs');
const postsCollection = client.db('ht02DB').collection('posts');

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

export type searchTemplate = {
    [field: string]: {$regex: string, $options?: 'i' | 'm' | 'x' | 's'} | string | undefined
}

export type queryPaginationTypeWithSearchConfig = {searchConfig: searchTemplate} & queryPaginationType;

export const paginationBlogsByQueryParams = async (
    paginationConfig: queryPaginationTypeWithSearchConfig): Promise<resultOfPaginationBlogsByQueryType> => {
    const {searchConfig, sortBy, sortDirection, pageNumber, pageSize} = paginationConfig;
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
        pagesCount: pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount: totalCount,
        items: arrayOfReturnedWithPaginationBlogs as any
    }
}

export const paginationPostsByQueryParams = async (
    paginationConfig: queryPaginationTypeWithSearchConfig): Promise<resultOfPaginationPostsByQueryType> => {
    const {searchConfig, sortBy, sortDirection, pageNumber, pageSize} = paginationConfig;
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
        pagesCount: pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount: totalCount,
        items: arrayOfReturnedWithPaginationPosts as any
    }
}