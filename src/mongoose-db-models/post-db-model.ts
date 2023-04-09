import {model, Schema} from "mongoose";
import {PostInTheDBType, PostMethodsType, PostMongooseModel} from "../models/post-models";
import {PostExtendedLikesInfoType, PostLikeModelType, PostNewestLikesType} from "../models/post-likes-models";
import {PostLikesModel} from "./post-likes-db-model";

const postSchema = new Schema<PostInTheDBType, PostMongooseModel, PostMethodsType>(
    {
        id: String,
        title: String,
        shortDescription: String,
        content: String,
        blogId: String,
        blogName: String,
        createdAt: Number
    }, {
        strict: true,
        versionKey: false
    }
);

postSchema.method('getLikesInfo',
    async function getLikesInfo(currentUserId?: string | null): Promise<PostExtendedLikesInfoType> {
        const postId = this.id;
        const likesFilter = {$and: [{postId}, {likeStatus: 'Like'}]};
        const dislikesFilter = {$and: [{postId}, {likeStatus: 'Dislike'}]};
        const likesByPostId: number = await PostLikesModel.countDocuments(likesFilter);
        const dislikesByPostId: number = await PostLikesModel.countDocuments(dislikesFilter);
        let myLikeStatus: 'Like' | 'Dislike' | 'None' = 'None';
        if (currentUserId) {
            const filter = {$and: [{userId: currentUserId}, {postId}]};
            const foundedLikeByUserId: PostLikeModelType | null = await PostLikesModel.findOne(filter).lean();
            if (foundedLikeByUserId) myLikeStatus = foundedLikeByUserId.likeStatus;
        }
        const getNewestLikes = async (): Promise<PostNewestLikesType[]> => {
            const findOptions = {
                sort: {addedAt: -1},
                limit: 3
            };
            const filter = {$and: [{postId}, {likeStatus: 'Like'}]};
            const postNewestLikes: PostLikeModelType[] = await PostLikesModel.find(filter, {}, findOptions);
            return postNewestLikes.map(postLikeFromDB => {
                return {
                    addedAt: new Date(postLikeFromDB.addedAt).toISOString(),
                    userId: postLikeFromDB.userId,
                    login: postLikeFromDB.userLogin
                }
            })
        }
        const newestLikes: PostNewestLikesType[] = await getNewestLikes();
        return {
            likesCount: likesByPostId,
            dislikesCount: dislikesByPostId,
            myLikeStatus,
            newestLikes
        }
})

export const PostModel = model<PostInTheDBType, PostMongooseModel>('Posts', postSchema);