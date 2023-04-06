import {model, Schema} from "mongoose";
import {PostInTheDBType, PostMethodsType, PostMongooseModel} from "../models/post-models";
import {PostExtendedLikesInfo} from "../models/post-likes-models";
import {CommentLikesModel} from "../models/comment-likes-model";

const postSchema = new Schema<PostInTheDBType, PostMongooseModel, PostMethodsType>(
    {
        id: String,
        title: String,
        shortDescription: String,
        content: String,
        blogId: String,
        blogName: String,
        createdAt: String
    }, {strict: true, versionKey: false}
);

postSchema.method('getLikesInfo',
    async function getLikesInfo(currentUserId?: string | null): Promise<PostExtendedLikesInfo> {
        const postId = this.id;
        const likesFilter = {$and: [{postId}, {likeStatus: 'Like'}]};
        const dislikesFilter = {$and: [{postId}, {likeStatus: 'Dislike'}]};
        const likesByCommentId: number = await CommentsLikesModel.countDocuments(likesFilter);
        const dislikesByCommentId: number = await CommentsLikesModel.countDocuments(dislikesFilter);
        let myLikeStatus: 'Like' | 'Dislike' | 'None' = 'None';
        if (currentUserId) {
            const filter = {$and: [{userId: currentUserId}, {postId}]};
            const foundedLikeByUserId: CommentLikesModel | null = await CommentsLikesModel.findOne(filter).lean();
            if (foundedLikeByUserId) myLikeStatus = foundedLikeByUserId.likeStatus;
        }
        return {
            likesCount: likesByCommentId,
            dislikesCount: dislikesByCommentId,
            myLikeStatus
        }
})

const PostModel = model<PostInTheDBType, PostMongooseModel>('Posts', postSchema);

export {
    PostModel
};