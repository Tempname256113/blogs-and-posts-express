
import request from "supertest"
import {app} from "../../../app";
import {blogsRepository} from "../../../repositories/blogs/blogsRepository";
import {postType, requestPostType} from "../../../models/postModels";
import {blogType} from "../../../models/blogModels";
import {postsRepository} from "../../../repositories/posts/postsRepository";
import {createNewBlogWithoutErrors} from "../../testsAdditional/blogs/additionalFunctionsForBlogsRouteTests";

const errorsTemplate = {
    errorCase1: {
        reqBody: {
            title: 123,
            shortDescription: 'some desc',
            content: 'some content for new created post',
            blogId: '123'
        },
        expectedResponseError: {
            errorsMessages: [
                {
                    message: expect.any(String),
                    field: "title"
                },
                {
                    message: expect.any(String),
                    field: "blogId"
                },
            ]
        }
    }
}

const createNewPostWithoutErrors = async (scenario: number = 1): Promise<postType> => {
    const newBlog: blogType = await createNewBlogWithoutErrors();
    interface INewPostTemplate {
        [scenario: string]: {
            reqBody: requestPostType;
            resBody: postType;
        }
    }
    const newPostTemplate: INewPostTemplate = {
        case1: {
            reqBody: {
                title: 'some title',
                shortDescription: 'some short description for new post',
                content: 'some new content for new created post',
                blogId: newBlog.id
            },
            resBody: {
                id: expect.any(String),
                title: 'some title',
                shortDescription: 'some short description for new post',
                content: 'some new content for new created post',
                blogId: newBlog.id,
                blogName: newBlog.name,
                createdAt: expect.any(String)
            }
        }
    }
    if (scenario > 1) {
        scenario = 1;
    }
    const response = await request(app)
        .post('/posts')
        .auth('admin', 'qwerty')
        .send(newPostTemplate[`case${scenario}`].reqBody)
        .expect(201)
    expect(response.body).toEqual(newPostTemplate[`case${scenario}`].resBody);
    return response.body;
}

const createUpdateNewPostWithoutErrors = async (scenario: number = 1): Promise<postType> => {
    const newPost = await createNewPostWithoutErrors();
    interface IUpdatePostTemplate {
        [scenario: string]: {
            reqBody: requestPostType
            resBody: postType
        }
    }
    const updatePostTemplate: IUpdatePostTemplate = {
        case1: {
            reqBody: {
                title: 'updated post title',
                shortDescription: 'some short description for updated post',
                content: 'content for updated post coming soon',
                blogId: newPost.blogId
            },
            resBody: {
                id: newPost.id,
                title: 'updated post title',
                shortDescription: 'some short description for updated post',
                content: 'content for updated post coming soon',
                blogId: newPost.blogId,
                blogName: newPost.blogName,
                createdAt: newPost.createdAt
            }
        }
    }
    const updatedPost = updatePostTemplate[`case${scenario}`].resBody;
    await request(app)
        .put(`/posts/${newPost.id}`)
        .auth('admin', 'qwerty')
        .send(updatePostTemplate[`case${scenario}`].reqBody)
        .expect(204)
    await request(app)
        .get(`/posts/${updatedPost.id}`)
        .expect(200, updatedPost)
    return updatedPost;
}

beforeAll( async () => {
    await blogsRepository.deleteAllData();
    await postsRepository.deleteAllData();
})

afterAll( async () => {
    await blogsRepository.deleteAllData();
    await postsRepository.deleteAllData();
})

describe('simple tests for route /posts', () => {

    it ('should return status 200 and empty array by GET method /posts', async () => {
        await request(app)
            .get('/posts')
            .expect(200, [])
    })

    it ('should return status 201 and new created post by POST method /posts, additional method GET /posts/:id', async () => {
        const newCreatedPost = await createNewPostWithoutErrors();
        const response = await request(app)
            .get(`/posts/${newCreatedPost.id}`)
            .expect(200)
        expect(response.body).toEqual(newCreatedPost)
    })

    it('should return status 204, update new created post by method PUT /posts/:id, additional methods POST /posts, GET /posts/:id', () => {
        createUpdateNewPostWithoutErrors();
    })

    it('should return status 204, delete new created post by method DELETE /posts/:id, additional method POST /posts', async() => {
        const newCreatedPost = await createNewPostWithoutErrors();
        await request(app)
            .delete(`/posts/${newCreatedPost.id}`)
            .auth('admin', 'qwerty')
            .expect(204)
    })

    it('should return status 400, use method POST /posts', async () => {
        const response = await request(app)
            .post('/posts')
            .auth('admin', 'qwerty')
            .send(errorsTemplate.errorCase1.reqBody)
            .expect(400)
        expect(response.body).toEqual(errorsTemplate.errorCase1.expectedResponseError)
    })
})