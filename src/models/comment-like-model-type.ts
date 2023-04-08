
type CommentLikeModelType = {
    commentId: string;
    userId: string;
    likeStatus: 'Like' | 'Dislike';
}

type CommentLikeInfoType = {
    likesCount: number;
    dislikesCount: number;
    myLikeStatus: 'None' | 'Like' | 'Dislike';
}

export {
    CommentLikeModelType,
    CommentLikeInfoType
}