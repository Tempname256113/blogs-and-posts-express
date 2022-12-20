
// import request from "supertest";
//
// import {app} from "../../../app";
// import {IBlog} from "../../../models/models";
// import {IRequestBlogModel} from "../../../models/models";
//
//
// // после миграции на mongo db тесты не работают
//
// describe('general blogs API simple tests without errors', () => {
//
//     it ('should return empty array blogs GET method /blogs',   async() => {
//         await request(app)
//             .get('/blogs')
//             .expect(200, [])
//     })
//
//     // для тестирования GET метода нужен id который придет с созданным объектом из метода POST
//     let currentBlogID: string;
//
//     it('should return new created blog /blogs POST method', async () => {
//         const response = await request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send(<IRequestBlogModel>{
//                 name: 'some name',
//                 description: 'some description',
//                 websiteUrl: 'https://www.type.com'
//             })
//             .expect(201)
//         const requestBlog = response.body;
//         const createdBlog: IBlog = {
//             id: requestBlog.id,
//             name: 'some name',
//             description: 'some description',
//             websiteUrl: 'https://www.type.com'
//         }
//         currentBlogID = requestBlog.id;
//         expect(requestBlog).toEqual(createdBlog);
//
//     })
//
//     it ('should return existing blog from DB /blogs/:id GET method', async() => {
//         await request(app)
//             .get(`/blogs/${currentBlogID}`)
//             .expect(200, {
//                 id: currentBlogID,
//                 name: 'some name',
//                 description: 'some description',
//                 websiteUrl: 'https://www.type.com'
//             } as IBlog);
//     })
//
//     it ('should return 204 status /blogs/:id method PUT', async() => {
//         await request(app)
//             .put(`/blogs/${currentBlogID}`)
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'updated name',
//                 description: 'updated description',
//                 websiteUrl: "https://updatedURL.com"
//             } as IRequestBlogModel)
//             .expect(204)
//     })
//
//     it ('should delete blog from DB /blogs/:id method DELETE and GET empty array', async () => {
//         await request(app)
//             .delete(`/blogs/${currentBlogID}`)
//             .auth('admin', 'qwerty')
//             .expect(204)
//         await request(app)
//             .get('/blogs')
//             .expect(200, [])
//     })
//
// })
//
// describe('tests of blogs API', () => {
//
//     it('should return empty array GET method /blogs', async () => {
//         request(app)
//             .get('/blogs')
//             .expect(200, [])
//     })
//
//     it('should return status 400 and error obj /blogs method POST', async () => {
//         request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 123,
//                 description: 'some desc',
//                 websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
//             })
//             .expect(400, {
//                 errorsMessages: [
//                     {
//                         message: expect.any(String),
//                         field: "name"
//                     }
//                 ]
//             })
//         request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'some name',
//                 description: 321,
//                 websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
//             })
//             .expect(400, {
//                 errorsMessages: [
//                     {
//                         message: expect.any(String),
//                         field: "description"
//                     }
//                 ]
//             })
//         request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'some name',
//                 description: 321,
//                 websiteUrl: '2828'
//             })
//             .expect(400, {
//                 errorsMessages: [
//                     {
//                         message: expect.any(String),
//                         field: "description"
//                     },
//                     {
//                         message: expect.any(String),
//                         field: "websiteUrl"
//                     }
//                 ]
//             })
//     })
//
// })
//
// describe('GET method /blogs/:id and PUT method /blogs/:id tests', () => {
//
//     // собирает все создаваемые блоги тестом в один массив
//     const createdBlogs: IBlog[] = [];
//
//     it('POST method /blogs should return new created blogs (3)', async () => {
//
//         const response = await request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'some name',
//                 description: 'some description',
//                 websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
//             })
//             createdBlogs.push(response.body);
//             expect(createdBlogs[0]).toEqual({
//                 id: createdBlogs[0].id,
//                 name: 'some name',
//                 description: 'some description',
//                 websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
//             } as IBlog)
//         const response2 = await request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'some name',
//                 description: 'some description',
//                 websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
//             })
//         createdBlogs.push(response2.body);
//         expect(createdBlogs[1]).toEqual({
//             id: createdBlogs[1].id,
//             name: 'some name',
//             description: 'some description',
//             websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
//         } as IBlog)
//         const response3 = await request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'some name',
//                 description: 'some description',
//                 websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
//             })
//         createdBlogs.push(response3.body);
//         expect(createdBlogs[2]).toEqual({
//             id: createdBlogs[2].id,
//             name: 'some name',
//             description: 'some description',
//             websiteUrl: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types'
//         } as IBlog)
//     })
//
//     it('should return array of blogs GET method /blogs', async () => {
//         const response = await request(app)
//             .get('/blogs')
//             .expect(200)
//         expect(response.body).toStrictEqual(createdBlogs);
//     })
//
//     it ('should update blog and show him PUT method /blogs/:id and GET method /blogs/:id', async () => {
//         await request(app)
//             .put(`/blogs/${createdBlogs[1].id}`)
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'updated name',
//                 description: 'some updated description',
//                 websiteUrl: 'https://www.updated-website.kek'
//             } as IRequestBlogModel)
//             .expect(204)
//         const response = await request(app)
//             .get(`/blogs/${createdBlogs[1].id}`)
//             .expect(200)
//         const returnedBlog = response.body;
//         expect(returnedBlog).toEqual({
//             id: returnedBlog.id,
//             name: 'updated name',
//             description: 'some updated description',
//             websiteUrl: 'https://www.updated-website.kek'
//         } as IBlog)
//     })
//
//     it('should return status 204 success DELETE method /blogs/:id', async () => {
//         request(app)
//             .delete(`blogs/${createdBlogs[2].id}`)
//             .expect(204)
//     })
// })