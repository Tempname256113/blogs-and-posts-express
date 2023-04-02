import {Document, Model} from "mongoose";
import {LikesInfoType} from "./comment-likes-model";

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

type CommentDocumentMongooseType = CommentInTheDBType & Document & {
    getLikesInfo: (currentUserId?: string | null) => Promise<LikesInfoType>
}

type CommentModelMongooseType = Model<CommentDocumentMongooseType>

export {
    CommentInTheDBType,
    CommentType,
    CommentDocumentMongooseType,
    CommentModelMongooseType
}