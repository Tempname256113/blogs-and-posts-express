type PostLikeModelType = {
    postId: string;
    userId: string;
    userLogin: string;
    addedAt: number;
    likeStatus: 'Like' | 'Dislike';
}

type PostNewestLikesType = {
    addedAt: string;
    userId: string;
    login: string;
}

type PostExtendedLikesInfoType = {
    likesCount: number;
    dislikesCount: number;
    myLikeStatus: 'None' | 'Like' | 'Dislike';
    newestLikes: PostNewestLikesType[]
}

export {
    PostLikeModelType,
    PostNewestLikesType,
    PostExtendedLikesInfoType
}