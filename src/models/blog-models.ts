
// такие объекты лежат в базе данных blogs
type BlogType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string
}

// такие объекты приходят в POST и PUT запросах для создания нового блога
// createBlogDto
type RequestBlogType = {
    name: string;
    description: string;
    websiteUrl: string;
}

export {
    BlogType,
    RequestBlogType
}