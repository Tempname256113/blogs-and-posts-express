
// такие объекты лежат в базе данных blogs
export type blogType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string
}

// такие объекты приходят в POST и PUT запросах для создания нового блога
export type requestBlogType = {
    name: string;
    description: string;
    websiteUrl: string;
}