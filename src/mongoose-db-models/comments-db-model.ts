import {model, Schema} from "mongoose";
import {CommentDocumentMongooseType, CommentModelMongooseType} from "../models/comment-models";
import {CommentLikesModel, LikesInfoType} from "../models/comment-likes-model";
import {commentsLikesModel} from "./likes-db-model";

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
        const likesFilter = {$and: [{commentId: this.id}, {likeStatus: 'Like'}]};
        const dislikesFilter = {$and: [{commentId: this.id}, {likeStatus: 'Dislike'}]};
        const likesByCommentId: number = await commentsLikesModel.count(likesFilter);
        const dislikesByCommentId: number = await commentsLikesModel.count(dislikesFilter);
        let myLikeStatus: 'Like' | 'Dislike' | 'None' = 'None';
        if (currentUserId) {
            const foundedLikeByUserId: CommentLikesModel | null = await commentsLikesModel.findOne({userId: currentUserId}).lean();
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