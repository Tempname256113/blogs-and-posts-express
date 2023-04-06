import {PostExtendedLikesInfo} from "./post-likes-models";
import {Model} from "mongoose";

// такие объекты лежат в базе данных posts
type PostInTheDBType = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
}

// такие объекты приходят в POST и PUT запросах для создания нового поста
type RequestPostType = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}

type PostType = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: PostExtendedLikesInfo
}

type PostMethodsType = {
    getLikesInfo(currentUserId?: string | null):  Promise<PostExtendedLikesInfo>
}

type PostMongooseModel = Model<PostInTheDBType, {}, PostMethodsType>

export {
    PostInTheDBType,
    RequestPostType,
    PostMethodsType,
    PostType,
    PostMongooseModel
}