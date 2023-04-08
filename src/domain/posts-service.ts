import {PostInTheDBType, PostType, RequestPostType} from "../models/post-models";
import {PostsRepository} from "../repositories/posts/posts-repository";
import {BlogsQueryRepository} from "../repositories/blogs/blogs-query-repository";
import {BlogType} from "../models/blog-models";
import {v4 as uuid4} from "uuid";
import {injectable} from "inversify";
import {PostLikeModelType} from "../models/post-likes-models";
import {PostsQueryRepository} from "../repositories/posts/posts-query-repository";
import {UserTypeExtended} from "../models/user-models";
import {UsersQueryRepository} from "../repositories/users/users-query-repository";

@injectable()
export class PostsService {
    constructor(
        protected blogsQueryRepository: BlogsQueryRepository,
        protected postsRepository: PostsRepository,
        protected postsQueryRepository: PostsQueryRepository,
        protected usersQueryRepository: UsersQueryRepository
    ) {}
    async createNewPost(newPost: RequestPostType): Promise<PostType> {
        /* blog придет потому что роут который обращается к этому сервису на уровне представления с помощью middleware
        уже проверил существует этот blog в базе данных или нет. если запрос дошел сюда, то он существует.
        еще одну проверку здесь делать не надо
        */
        const blog: BlogType | null = await this.blogsQueryRepository.getBlogByID(newPost.blogId);
        const newPostTemplate: PostInTheDBType = {
            id: uuid4(),
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name,
            createdAt: new Date().getTime()
        };
        const newPostToClient: PostType = {
            id: newPostTemplate.id,
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name,
            createdAt: new Date(newPostTemplate.createdAt).toISOString(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        };
        await this.postsRepository.createNewPost(newPostTemplate);
        return newPostToClient;
    };
    async updatePostByID(id: string, requestPost: RequestPostType): Promise<boolean> {
        return this.postsRepository.updatePostByID(id, requestPost);
    };
    async deletePostByID(id: string): Promise<boolean> {
        return this.postsRepository.deletePostByID(id);
    };
    async deleteAllData(): Promise<void> {
        await this.postsRepository.deleteAllData();
    };
    async changeLikeStatus(changeLikeStatusData: {likeStatus: 'None' | 'Like' | 'Dislike', userId: string, postId: string}): Promise<void>{
        if (changeLikeStatusData.likeStatus === 'None') {
            await this.postsRepository.deleteLikeStatus(changeLikeStatusData.userId, changeLikeStatusData.postId);
        } else {
            const foundedLike: PostLikeModelType | null = await this.postsQueryRepository.getLike(changeLikeStatusData.userId, changeLikeStatusData.postId);
            if (!foundedLike) {
                const user: UserTypeExtended | null = await this.usersQueryRepository.getUserById(changeLikeStatusData.userId);
                const userLogin = user!.accountData.login;
                await this.postsRepository.addLikeStatus({
                    postId: changeLikeStatusData.postId,
                    userId: changeLikeStatusData.userId,
                    userLogin,
                    addedAt: new Date().getTime(),
                    likeStatus: changeLikeStatusData.likeStatus
                });
            } else {
                await this.postsRepository.updateLikeStatus({
                    userId: changeLikeStatusData.userId,
                    postId: changeLikeStatusData.postId,
                    likeStatus: changeLikeStatusData.likeStatus
                });
            }
        }
    };
    async deleteAllPostsLikes(): Promise<void>{
        await this.postsRepository.deleteAllPostsLikes();
    };
}