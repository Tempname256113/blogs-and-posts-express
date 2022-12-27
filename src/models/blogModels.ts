
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