import {model, Schema} from "mongoose";
import {CommentInTheDBType} from "../models/comment-model";

const commentSchema = new Schema<CommentInTheDBType>(
    {
        postId: String,
        id: String,
        content: String,
        userId: String,
        userLogin: String,
        createdAt: String
    }
);

const CommentModel = model<CommentInTheDBType>('Comments', commentSchema);

export {
    CommentModel
}