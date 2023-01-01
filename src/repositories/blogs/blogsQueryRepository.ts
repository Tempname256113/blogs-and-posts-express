
import {client} from "../../db";
import {ObjectId, Sort} from "mongodb";
import {blogType} from "../../models/blogModels";
import {postType} from "../../models/postModels";

const blogsCollection = client.db('ht02DB').collection('blogs');
const postsCollection = client.db('ht02DB').collection('posts');

type blogByQueryHT04Type = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogType[]
}

type postByQueryHT04Type = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: postType[]
}

export const blogsQueryRepository = {
    async getBlogByQueryHT04(searchNameTerm: string | null = null,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    pageNumber: number = 1,
    pageSize: number = 10): Promise<blogByQueryHT04Type> {
        const howMuchToSkip = (Number(pageNumber) - 1) * Number(pageSize);
        let sortDir: number;
        switch (sortDirection) {
            case 'asc':
                sortDir = 1;
                break;
            case 'desc':
                sortDir = -1;
                break;
            default:
                sortDir = -1;
        }
        const sortConfig = {[sortBy]: sortDir} as Sort;
        let arrayOfReturnedBlogs;
        let pagesCount: number;
        let allBlogsFromDB;
        let totalCount: number;
        if (searchNameTerm) {
            arrayOfReturnedBlogs = await blogsCollection.find({name: searchNameTerm}).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false}).toArray();
            allBlogsFromDB = await blogsCollection.find({name: searchNameTerm}).toArray();
            totalCount = allBlogsFromDB.length;
            pagesCount = Math.ceil(totalCount / Number(pageSize));
            return {
                pagesCount: pagesCount,
                page: Number(pageNumber),
                pageSize: Number(pageSize),
                totalCount: totalCount,
                items: arrayOfReturnedBlogs as any
            }
        }
        arrayOfReturnedBlogs = await blogsCollection.find({}).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false}).toArray();
        allBlogsFromDB = await blogsCollection.find({}).toArray();
        totalCount = allBlogsFromDB.length;
        pagesCount = Math.ceil(totalCount / Number(pageSize));
        return {
            pagesCount: pagesCount,
            page: Number(pageNumber),
            pageSize: Number(pageSize),
            totalCount: totalCount,
            items: arrayOfReturnedBlogs as any
        }
    },
    async getAllPostsForSpecifiedBlog(
        blogId: string,
        pageNumber: number = 1,
        pageSize: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<postByQueryHT04Type> {
        const howMuchToSkip = (Number(pageNumber) - 1) * Number(pageSize);
        let sortDir: number;
        switch (sortDirection) {
            case 'asc':
                sortDir = 1;
                break;
            case 'desc':
                sortDir = -1;
                break;
            default:
                sortDir = -1;
        }
        const sortConfig = {[sortBy]: sortDir} as Sort;
        let arrayOfReturnedPosts;
        let pagesCount: number;
        let allPostsFromDBWithBlogIdFilter;
        let totalCount: number;
        arrayOfReturnedPosts = await postsCollection.find({blogId: blogId}).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false}).toArray();
        allPostsFromDBWithBlogIdFilter = await postsCollection.find({blogId: blogId}).toArray();
        totalCount = allPostsFromDBWithBlogIdFilter.length;
        pagesCount = Math.ceil(totalCount / Number(pageSize));
        return {
            pagesCount: pagesCount,
            page: Number(pageNumber),
            pageSize: Number(pageSize),
            totalCount: Number(totalCount),
            items: arrayOfReturnedPosts as any
        }
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