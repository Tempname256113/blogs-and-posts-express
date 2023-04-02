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
        const likesFilter = {$and: [{commentId: this.commentId}, {likeStatus: 'Like'}]};
        const dislikesFilter = {$and: [{commentId: this.commentId}, {likeStatus: 'Dislike'}]};
        const likesByCommentId: number = await CommentsLikesModel.count(likesFilter);
        const dislikesByCommentId: number = await CommentsLikesModel.count(dislikesFilter);
        let myLikeStatus: 'Like' | 'Dislike' | 'None' = 'None';
        if (currentUserId) {
            const foundedLikeByUserId: CommentLikesModel | null = await CommentsLikesModel.findOne({userId: currentUserId}).lean();
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