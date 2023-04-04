import {NextFunction, Response} from "express";
import {jwtMethods} from "../routes/application/jwt-methods";
import {AccessTokenPayloadType} from "../models/token-models";
import {CommentsQueryRepository} from "../repositories/comments/comments-query-repository";
import {RequestWithURIParams} from "../models/req-res-models";
import {CommentInTheDBType, CommentType} from "../models/comment-models";
import {container} from "../composition-root";

const commentsQueryRepository = container.resolve(CommentsQueryRepository);

/* middleware для проверки существования комментария и его принадлежности пользователю который хочет его изменить.
* если комментарий пользователю не принадлежит, то в ответе возвращается 403 код
* если комментарий не нашелся в базе данных, то в ответе возвращается 404 код */
export const checkForChangeCommentMiddleware = async (req: RequestWithURIParams<{commentId: string}>, res: Response, next: NextFunction) => {
    /* я уверен в том, что здесь значения будут потому что этот middleware нужно использовать после middleware проверки
    на актуальность токена пользователя */
    const userTokenPayload: AccessTokenPayloadType = jwtMethods.compareToken.accessToken(req.headers.authorization!)!;
    const foundedCommentById: CommentInTheDBType | null = await commentsQueryRepository.getCommentByID(req.params.commentId);
    if (foundedCommentById) {
        if (foundedCommentById.userId === userTokenPayload.userId) {
            return next();
        }
        return res.sendStatus(403);
    }
    return res.sendStatus(404);
}