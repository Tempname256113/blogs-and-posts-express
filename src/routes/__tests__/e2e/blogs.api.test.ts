
import request from "supertest";

import {app} from "../../../app";
import {BlogType, RequestBlogType} from "../../../models/blog-models";
import {BlogsRepository} from "../../../repositories/blogs/blogs-repository";
import {PostsRepository} from "../../../repositories/posts/posts-repository";
import {createNewBlogWithoutErrors} from "../../testsAdditional/blogs/additionalFunctionsForBlogsRouteTests";
import {container} from "../../../composition-root";

const postsRepository = container.resolve(PostsRepository);
const blogsRepository = container.resolve(BlogsRepository);

const errorsTemplate = {
    errorCase1: {
        reqBody: {
            name: 123,
            description: 'some desc',
            websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
        },
        expectedResponseError: {
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: "name"
                }
            ]
        }
    },
    errorCase2: {
        reqBody: {
            name: 'some name',
            description: 321,
            websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
        },
        expectedResponseError: {
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: "description"
                }
            ]
        }
    },
    errorCase3: {
        reqBody: {
            name: 'some name',
            description: 321,
            websiteUrl: '2828'
        },
        expectedResponseError: {
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: "description"
                },
                {
                    message: expect.any(String),
                    field: "websiteUrl"
                }
            ]
        }
    },
}

const createUpdateNewBlogWithoutErrors = async (scenario: number = 1): Promise<BlogType> => {
    const createdBlog = await createNewBlogWithoutErrors();
    interface IUpdateBlogTemplate {
        [scenario: string]: {
            reqBody: RequestBlogType
            resBody: BlogType
        }
    }
    const updateBlogTemplate: IUpdateBlogTemplate = {
        case1: {
            reqBody: {
                name: 'updated blog',
                description: 'updated blog description',
                websiteUrl: 'https://www.updated.com'
            },
            resBody: {
                id: createdBlog.id,
                name: 'updated blog',
                description: 'updated blog description',
                websiteUrl: 'https://www.updated.com',
                createdAt: createdBlog.createdAt
            }
        }
    }

    await request(app)
        .put(`/blogs/${createdBlog.id}`)
        .auth('admin', 'qwerty')
        .send(updateBlogTemplate[`case${scenario}`].reqBody)
        .expect(204)
    const updatedBlog: BlogType = updateBlogTemplate[`case${scenario}`].resBody;
    await request(app)
        .get(`/blogs/${updatedBlog.id}`)
        .expect(200, updatedBlog)
    return updatedBlog
}

const updateExistingBlogWithoutErrors = async (existingBlog: BlogType, reqBody: RequestBlogType): Promise<BlogType> => {
    await request(app)
        .put(`/blogs/${existingBlog.id}`)
        .auth('admin', 'qwerty')
        .send(reqBody)
        .expect(204)
    const updatedBlog: BlogType = {
        id: existingBlog.id,
        name: reqBody.name,
        description: reqBody.description,
        websiteUrl: reqBody.websiteUrl,
        createdAt: existingBlog.createdAt
    }
    await request(app)
        .get(`/blogs/${existingBlog.id}`)
        .expect(200, updatedBlog)
    return updatedBlog;
}

beforeAll( async () => {
    await blogsRepository.deleteAllData();
    await postsRepository.deleteAllData();
})

afterAll( async () => {
    await blogsRepository.deleteAllData();
    await postsRepository.deleteAllData();
})

describe('general blogs API simple tests without errors', () => {

    it('should return empty array by GET method /blogs', async () => {
        await request(app)
            .get('/blogs')
            .expect(200, [])
    })

    it('should return new created blog by POST method /blogs', async () => {
        await createNewBlogWithoutErrors();
    })

    it ('should return existent blog from DB by /blogs/:id GET method additional method POST /blogs', async () => {
        const existentBlog = await createNewBlogWithoutErrors();
        const response = await request(app)
            .get(`/blogs/${existentBlog.id}`)
            .expect(200)
        expect(response.body).toEqual(existentBlog)
    })

    it('should return 204 status by PUT method /blogs/:id and return updated blog. additional methods POST /blogs and GET /blogs/:id', async () => {
        await createUpdateNewBlogWithoutErrors();
    })

    it('should delete blog from DB by DELETE method /blogs/:id. additional methods GET /blogs/:id and POST /blogs', async () => {
        const existentBlog = await createNewBlogWithoutErrors();
        await request(app)
            .delete(`/blogs/${existentBlog.id}`)
            .auth('admin', 'qwerty')
            .expect(204)
        await request(app)
            .get(`/blogs/${existentBlog.id}`)
            .expect(404)
    })

})

describe('testing for errors', () => {

    it ('should return status 400 and error obj by POST method /blogs', async () => {
        request(app)
            .post('/blogs')
            .auth('admin', 'qwerty')
            .send(errorsTemplate.errorCase1.reqBody)
            .expect(400, errorsTemplate.errorCase1.expectedResponseError)
        request(app)
            .post('/blogs')
            .auth('admin', 'qwerty')
            .send(errorsTemplate.errorCase2.reqBody)
            .expect(400, errorsTemplate.errorCase2.expectedResponseError)
        request(app)
            .post('/blogs')
            .auth('admin', 'qwerty')
            .send(errorsTemplate.errorCase3.reqBody)
            .expect(400, errorsTemplate.errorCase3.expectedResponseError)
    })

})