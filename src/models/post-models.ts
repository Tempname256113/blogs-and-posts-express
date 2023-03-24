
// такие объекты лежат в базе данных posts
type PostType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string
    createdAt: string
}

// такие объекты приходят в POST и PUT запросах для создания нового поста
type RequestPostType = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}

export {
    PostType,
    RequestPostType
}