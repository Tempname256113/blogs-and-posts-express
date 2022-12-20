//
// import request from "supertest";
// import {app} from "../../../app"
// import {IBlog, IErrorObj, IPost, IRequestBlogModel, IRequestPostModel} from "../../../models/models";
// import {blogsRepository} from "../../../repositories/blogsRepository";
//
//
//
// describe('simple tests for routes /posts', () => {
//
//     it('should return status 200 and empty array GET method /posts', async () => {
//         await request(app)
//             .get('/posts')
//             .expect(200, []);
//     })
//
//     it ('should return error obj invalid blogId POST method /posts', async () => {
//         const response = await request(app)
//             .post('/posts')
//             .auth('admin', 'qwerty')
//             .send({
//                 title: 'some title',
//                 shortDescription: 'some short description for new post',
//                 content: 'some new content for new created post',
//                 blogId: '123'
//             } as IRequestPostModel)
//             .expect(400)
//         const newError = response.body;
//         expect(newError).toEqual({
//             errorsMessages: [
//                 {
//                     message: expect.any(String),
//                     field: 'blogId'
//                 }
//             ]
//         } as IErrorObj);
//     })
//
//     it('should create new post by POST method /blogs and POST method /posts', async() => {
//         const responseBlog = await request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'name for posts',
//                 description: 'description for posts route',
//                 websiteUrl: 'https://vercel.com/tempname256113/ht1'
//             } as IRequestBlogModel)
//             .expect(201)
//         const newCreatedBlog: IBlog = responseBlog.body;
//             expect(newCreatedBlog).toEqual({
//                 id: newCreatedBlog.id,
//                 name: 'name for posts',
//                 description: 'description for posts route',
//                 websiteUrl: 'https://vercel.com/tempname256113/ht1'
//             } as IBlog)
//
//         const responsePosts = await request(app)
//             .post('/posts')
//             .auth('admin', 'qwerty')
//             .send({
//                 title: 'new post title',
//                 shortDescription: 'new short description for post',
//                 content: 'here will be content for this post',
//                 blogId: newCreatedBlog.id
//             } as IRequestPostModel)
//             .expect(201)
//         const newCreatedPost: IPost = responsePosts.body;
//             expect(newCreatedPost).toEqual({
//                 id: newCreatedPost.id,
//                 title: 'new post title',
//                 shortDescription: 'new short description for post',
//                 content: 'here will be content for this post',
//                 blogId: newCreatedBlog.id,
//                 blogName: newCreatedBlog.name
//             } as IPost)
//     })
//
//     it ('should return status 200 and created post used methods POST /blogs, POST /posts and GET /posts/:id', async () => {
//         const responseBlog = await request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'some name',
//                 description: 'some description for this blog',
//                 websiteUrl: 'https://github.com/Tempname256113'
//             } as IRequestBlogModel)
//             .expect(201)
//         const newCreatedBlog = responseBlog.body;
//         expect(newCreatedBlog).toEqual({
//             id: newCreatedBlog.id,
//             name: 'some name',
//             description: 'some description for this blog',
//             websiteUrl: 'https://github.com/Tempname256113'
//         } as IBlog)
//
//         const responsePost = await request(app)
//             .post('/posts')
//             .auth('admin', 'qwerty')
//             .send({
//                 title: 'some post title',
//                 shortDescription: 'some short description for new created post',
//                 content: 'content for new created post coming soon',
//                 blogId: newCreatedBlog.id
//             } as IRequestPostModel)
//             .expect(201)
//         const newCreatedPost = responsePost.body;
//         expect(newCreatedPost).toEqual({
//             id: newCreatedPost.id,
//             title: 'some post title',
//             shortDescription: 'some short description for new created post',
//             content: 'content for new created post coming soon',
//             blogId: newCreatedBlog.id,
//             blogName: blogsRepository.findBlogNameByID(newCreatedBlog.id)
//         } as IPost)
//         await request(app)
//             .get(`/posts/${newCreatedPost.id}`)
//             .expect(200, newCreatedPost)
//     })
//
//     it ('should return status 204 and update post used methods POST /blogs, POST /posts, PUT /posts/:id and GET /posts/:id',
//         async () => {
//         const responseBlog = await request(app)
//             .post('/blogs')
//             .auth('admin', 'qwerty')
//             .send({
//                 name: 'some name',
//                 description: 'some description for this blog',
//                 websiteUrl: 'https://github.com/Tempname256113'
//             } as IRequestBlogModel)
//             .expect(201)
//         const newCreatedBlog = responseBlog.body;
//         expect(newCreatedBlog).toEqual({
//             id: newCreatedBlog.id,
//             name: 'some name',
//             description: 'some description for this blog',
//             websiteUrl: 'https://github.com/Tempname256113'
//         } as IBlog)
//
//         const responsePost = await request(app)
//             .post('/posts')
//             .auth('admin', 'qwerty')
//             .send({
//                 title: 'some post title',
//                 shortDescription: 'some short description for new created post',
//                 content: 'content for new created post coming soon',
//                 blogId: newCreatedBlog.id
//             } as IRequestPostModel)
//             .expect(201)
//         const newCreatedPost = responsePost.body;
//         expect(newCreatedPost).toEqual({
//             id: newCreatedPost.id,
//             title: 'some post title',
//             shortDescription: 'some short description for new created post',
//             content: 'content for new created post coming soon',
//             blogId: newCreatedBlog.id,
//             blogName: blogsRepository.findBlogNameByID(newCreatedBlog.id)
//         } as IPost)
//
//             await request(app)
//                 .put(`/posts/${newCreatedPost.id}`)
//                 .auth('admin', 'qwerty')
//                 .send({
//                     title: 'updated title',
//                     shortDescription: 'updated description',
//                     content: 'updated content',
//                     blogId: newCreatedBlog.id
//                 } as IRequestPostModel)
//                 .expect(204)
//
//
//         await request(app)
//             .get(`/posts/${newCreatedPost.id}`)
//             .expect(200, {
//                 id: newCreatedPost.id,
//                 title: 'updated title',
//                 shortDescription: 'updated description',
//                 content: 'updated content',
//                 blogId: newCreatedBlog.id,
//                 blogName: newCreatedBlog.name
//             } as IPost)
//     })
//
//     it ('test DELETE method /posts/:id by methods POST /blogs, POST, /posts, PUT /posts/:id, GET /posts:id',
//         async () => {
//             const responseBlog = await request(app)
//                 .post('/blogs')
//                 .auth('admin', 'qwerty')
//                 .send({
//                     name: 'some name',
//                     description: 'some description for this blog',
//                     websiteUrl: 'https://github.com/Tempname256113'
//                 } as IRequestBlogModel)
//                 .expect(201)
//             const newCreatedBlog = responseBlog.body;
//             expect(newCreatedBlog).toEqual({
//                 id: newCreatedBlog.id,
//                 name: 'some name',
//                 description: 'some description for this blog',
//                 websiteUrl: 'https://github.com/Tempname256113'
//             } as IBlog)
//
//             const responsePost = await request(app)
//                 .post('/posts')
//                 .auth('admin', 'qwerty')
//                 .send({
//                     title: 'some post title',
//                     shortDescription: 'some short description for new created post',
//                     content: 'content for new created post coming soon',
//                     blogId: newCreatedBlog.id
//                 } as IRequestPostModel)
//                 .expect(201)
//             const newCreatedPost = responsePost.body;
//             expect(newCreatedPost).toEqual({
//                 id: newCreatedPost.id,
//                 title: 'some post title',
//                 shortDescription: 'some short description for new created post',
//                 content: 'content for new created post coming soon',
//                 blogId: newCreatedBlog.id,
//                 blogName: blogsRepository.findBlogNameByID(newCreatedBlog.id)
//             } as IPost)
//
//             await request(app)
//                 .put(`/posts/${newCreatedPost.id}`)
//                 .auth('admin', 'qwerty')
//                 .send({
//                     title: 'updated title',
//                     shortDescription: 'updated description',
//                     content: 'updated content',
//                     blogId: newCreatedBlog.id
//                 } as IRequestPostModel)
//                 .expect(204)
//
//
//             await request(app)
//                 .get(`/posts/${newCreatedPost.id}`)
//                 .expect(200, {
//                     id: newCreatedPost.id,
//                     title: 'updated title',
//                     shortDescription: 'updated description',
//                     content: 'updated content',
//                     blogId: newCreatedBlog.id,
//                     blogName: newCreatedBlog.name
//                 } as IPost)
//
//             await request(app)
//                 .delete(`/posts/${newCreatedPost.id}`)
//                 .auth('admin', 'qwerty')
//                 .expect(204)
//
//             await request(app)
//                 .delete(`/posts/${newCreatedPost.id}`)
//                 .auth('admin', 'qwerty')
//                 .expect(404)
//         })
//
// })