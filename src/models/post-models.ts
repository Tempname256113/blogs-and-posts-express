import {PostExtendedLikesInfoType, PostNewestLikesType} from "./post-likes-models";
import {Model} from "mongoose";

// такие объекты лежат в базе данных posts
type PostInTheDBType = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: number;
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
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: 'None' | 'Like' | 'Dislike';
        newestLikes: PostNewestLikesType[]
    }
}

type PostMethodsType = {
    getLikesInfo(currentUserId?: string | null):  Promise<PostExtendedLikesInfoType>
}

type PostMongooseModel = Model<PostInTheDBType, {}, PostMethodsType>

export {
    PostInTheDBType,
    RequestPostType,
    PostMethodsType,
    PostType,
    PostMongooseModel
}