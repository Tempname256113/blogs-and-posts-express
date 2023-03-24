

import request from "supertest";
import {app} from "../../../app";
import {BlogType, RequestBlogType} from "../../../models/blog-models";

export const createNewBlogWithoutErrors = async (scenario: number = 1): Promise<BlogType> => {
    interface INewBlogTemplate {
        [scenario: string]: {
            reqBody: RequestBlogType,
            resBody: BlogType
        }
    }
    const newBlogTemplate: INewBlogTemplate = {
        case1: {
            reqBody: {
                name: 'some blog',
                description: 'some blog description',
                websiteUrl: 'https://www.default.com'
            },
            resBody: {
                id: expect.any(String),
                name: 'some blog',
                description: 'some blog description',
                websiteUrl: 'https://www.default.com',
                createdAt: expect.any(String)
            }
        }
    }
    const response = await request(app)
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(newBlogTemplate[`case${scenario}`].reqBody)
        .expect(201)
    expect(response.body).toEqual(newBlogTemplate[`case${scenario}`].resBody);
    return response.body;
}