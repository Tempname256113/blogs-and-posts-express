
type CommentLikesModel = {
    commentId: string,
    userId: string,
    likeStatus: 'Like' | 'Dislike'
}

type LikesInfoType = {
    likesCount: number,
    dislikesCount: number,
    myLikeStatus: 'None' | 'Like' | 'Dislike'
}

export {
    CommentLikesModel,
    LikesInfoType
}