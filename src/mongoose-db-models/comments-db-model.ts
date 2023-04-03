import {model, Schema} from "mongoose";
import {CommentDocumentMongooseType, CommentModelMongooseType} from "../models/comment-models";
import {CommentLikesModel, LikesInfoType} from "../models/comment-likes-model";
import {CommentsLikesModel} from "./likes-db-model";

const commentSchema = new Schema<CommentDocumentMongooseType>(
    {
        postId: String,
        commentId: String,
        content: String,
        userId: String,
        userLogin: String,
        createdAt: String
    }, {
        strict: true,
        versionKey: false,
    }
);

commentSchema.methods = {
    async getLikesInfo(currentUserId: string | null = null): Promise<LikesInfoType>{
        const commentId = this.commentId;
        const likesFilter = {$and: [{commentId}, {likeStatus: 'Like'}]};
        const dislikesFilter = {$and: [{commentId}, {likeStatus: 'Dislike'}]};
        const likesByCommentId: number = await CommentsLikesModel.countDocuments(likesFilter);
        const dislikesByCommentId: number = await CommentsLikesModel.countDocuments(dislikesFilter);
        let myLikeStatus: 'Like' | 'Dislike' | 'None' = 'None';
        if (currentUserId) {
            const filter = {$and: [{userId: currentUserId}, {commentId}]};
            const foundedLikeByUserId: CommentLikesModel | null = await CommentsLikesModel.findOne(filter).lean();
            if (foundedLikeByUserId) myLikeStatus = foundedLikeByUserId.likeStatus;
        }
        return {
            likesCount: likesByCommentId,
            dislikesCount: dislikesByCommentId,
            myLikeStatus
        }
    }
}

const CommentModel = model<CommentDocumentMongooseType, CommentModelMongooseType>('Comments', commentSchema);

export {
    CommentModel
}