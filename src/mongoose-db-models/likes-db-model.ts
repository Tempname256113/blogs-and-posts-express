import {model, Schema} from "mongoose";
import {CommentLikesModel} from "../models/comment-likes-model";

const commentsLikesSchema = new Schema<CommentLikesModel>(
    {
        commentId: String,
        userId: String,
        likeStatus: String
    }, {
        strict: true,
        versionKey: false,
        collection: 'comments-likes'
    });

const CommentsLikesModel = model<CommentLikesModel>('comments-likes', commentsLikesSchema);

export {
    CommentsLikesModel
}