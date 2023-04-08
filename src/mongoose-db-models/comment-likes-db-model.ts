import {model, Schema} from "mongoose";
import {CommentLikeModelType} from "../models/comment-like-model-type";

const commentsLikesSchema = new Schema<CommentLikeModelType>(
    {
        commentId: String,
        userId: String,
        likeStatus: String
    }, {
        strict: true,
        versionKey: false,
        collection: 'comments-likes'
    });

const CommentsLikesModel = model<CommentLikeModelType>('comments-likes', commentsLikesSchema);

export {
    CommentsLikesModel
}