import {Document, Model} from "mongoose";
import {CommentLikeInfoType} from "./comment-like-model-type";

type CommentInTheDBType = {
    postId: string,
    commentId: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string
}

type CommentType = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    createdAt: string,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: 'None' | 'Like' | 'Dislike'
    }
}

type CommentMethodsType = {
    getLikesInfo(currentUserId?: string | null):  Promise<CommentLikeInfoType>
}

type CommentMongooseModel = Model<CommentInTheDBType, {}, CommentMethodsType>

export {
    CommentInTheDBType,
    CommentType,
    CommentMethodsType,
    CommentMongooseModel
}