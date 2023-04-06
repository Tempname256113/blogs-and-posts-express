
type CommentLikesModel = {
    commentId: string;
    userId: string;
    likeStatus: 'Like' | 'Dislike';
}

type CommentLikesInfoType = {
    likesCount: number;
    dislikesCount: number;
    myLikeStatus: 'None' | 'Like' | 'Dislike';
}

export {
    CommentLikesModel,
    CommentLikesInfoType
}