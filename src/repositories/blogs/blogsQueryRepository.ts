
import {client} from "../../db";
import {Sort} from "mongodb";
import {blogType} from "../../models/blogModels";

const db = client.db('ht02DB').collection('blogs');

type blogByQueryHT04Type = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogType[]
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
            arrayOfReturnedBlogs = await db.find({name: searchNameTerm}).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false}).toArray();
            allBlogsFromDB = await db.find({name: searchNameTerm}).toArray();
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
        arrayOfReturnedBlogs = await db.find({}).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false}).toArray();
        allBlogsFromDB = await db.find({}).toArray();
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
}