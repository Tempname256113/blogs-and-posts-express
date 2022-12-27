
// такие объекты лежат в базе данных posts
export interface IPost {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string
    createdAt: string
}

// такие объекты приходят в POST и PUT запросах для создания нового поста
export interface IRequestPostModel {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}