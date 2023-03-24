import {model, Schema} from "mongoose";
import {BlogType} from "../models/blog-models";

const blogSchema = new Schema<BlogType>(
    {
        id: String,
        name: String,
        description: String,
        websiteUrl: String,
        createdAt: String
    }, {strict: true, versionKey: false}
);

const BlogModel = model<BlogType>('Blogs', blogSchema);

export {
    BlogModel
};