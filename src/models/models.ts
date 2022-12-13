

// такие объекты лежат в базе данных
export interface IBlog {
    id: string,
    name: string,
    description: string,
    websiteUrl: string
}

// такие объекты приходят в POST и PUT запросах
export interface IRequestBlogModel {
    name: string;
    description: string;
    websiteUrl: string;
}