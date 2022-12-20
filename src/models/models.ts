

// такие объекты лежат в базе данных blogs
export interface IBlog {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string
}

// такие объекты приходят в POST и PUT запросах для создания нового блога
export interface IRequestBlogModel {
    name: string;
    description: string;
    websiteUrl: string;
}

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

// такие объекты приходят в случае ошибок
interface insideErrorObj {
    message: string,
    field: string
}

export interface IErrorObj {
    errorsMessages: insideErrorObj[];
}