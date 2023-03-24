
type CommentInTheDBType = {
    postId: string,
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string
}

type CommentType = {
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string
}

export {
    CommentInTheDBType,
    CommentType
}