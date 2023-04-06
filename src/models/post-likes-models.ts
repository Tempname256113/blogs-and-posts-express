type PostLikesModel = {
    postId: string;
    userId: string;
    userLogin: string;
    addedAt: number;
    likeStatus: 'Like' | 'Dislike';
}

type PostNewestLikes = {
    addedAt: string;
    userId: string;
    login: string;
}

type PostExtendedLikesInfo = {
    likesCount: number;
    dislikesCount: number;
    myLikeStatus: 'None' | 'Like' | 'Dislike';
    newestLikes: PostNewestLikes[]
}

export {
    PostLikesModel,
    PostNewestLikes,
    PostExtendedLikesInfo
}