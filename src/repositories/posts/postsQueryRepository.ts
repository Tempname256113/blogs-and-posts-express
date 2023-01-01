
import {client} from "../../db";
import {ObjectId, Sort} from "mongodb";
import {postType} from "../../models/postModels";

const postsCollection = client.db('ht02DB').collection('posts');

export const postsQueryRepository = {
    async getPostsWithSortAndPaginationQuery(
        pageNumber: number = 1,
        pageSize: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: 'asc' | 'desc' = 'desc'
    ) {
        const howMuchToSkip = (Number(pageNumber) - 1) * Number(pageSize);
        let sortDir: number;
        switch (sortDirection) {
            case 'asc':
                sortDir = 1;
                break;
            case 'desc':
                sortDir = -1;
                break;
        }
        const sortConfig = {[sortBy]: sortDir} as Sort;
        let arrayOfReturnedPosts;
        let pagesCount: number;
        let allPostsFromDB;
        let totalCount: number;
        arrayOfReturnedPosts = await postsCollection.find({}).sort(sortConfig).limit(Number(pageSize)).skip(howMuchToSkip).project({_id: false}).toArray();
        allPostsFromDB = await postsCollection.find({}).toArray();
        totalCount = allPostsFromDB.length;
        pagesCount = Math.ceil(totalCount / Number(pageSize));
        return {
            pagesCount: pagesCount,
            page: Number(pageNumber),
            pageSize: Number(pageSize),
            totalCount: Number(totalCount),
            items: arrayOfReturnedPosts as any
        }
    },
    async getPostByID(id: string): Promise<postType & {_id?: ObjectId} | null> {
        const foundedPost = await postsCollection.findOne({id: id});
        if (foundedPost) {
            const copyFoundedPost: postType & {_id?: ObjectId} = {
                _id: foundedPost._id,
                id: foundedPost.id,
                title: foundedPost.title,
                shortDescription: foundedPost.shortDescription,
                content: foundedPost.content,
                blogId: foundedPost.blogId,
                blogName: foundedPost.blogName,
                createdAt: foundedPost.createdAt
            }
            delete copyFoundedPost._id;
            return copyFoundedPost;
        }
        return null;
    }
}