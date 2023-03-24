import {model, Schema} from "mongoose";
import {PostType} from "../models/post-models";

const postSchema = new Schema<PostType>(
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

const PostModel = model<PostType>('Posts', postSchema);

export {
    PostModel
};