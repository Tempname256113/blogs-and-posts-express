import {model, Schema} from "mongoose";
import {PostLikeModelType} from "../models/post-likes-models";

const postLikesSchema = new Schema<PostLikeModelType>({
    postId: String,
    userId: String,
    userLogin: String,
    addedAt: Number,
    likeStatus: String
}, {
    strict: true,
    versionKey: false,
    collection: 'posts-likes'
});

export const PostLikesModel = model<PostLikeModelType>('posts-likes', postLikesSchema);