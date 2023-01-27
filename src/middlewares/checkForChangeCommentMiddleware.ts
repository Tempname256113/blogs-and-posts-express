import {NextFunction, Response} from "express";
import {jwtMethods} from "../routes/application/jwtMethods";
import {accessTokenPayloadType} from "../models/tokenModels";
import {commentsQueryRepository} from "../repositories/comments/commentsQueryRepository";
import {RequestWithURIParams} from "../models/reqResModels";
import {commentType} from "../models/commentModel";

export const checkForChangeCommentMiddleware = async (req: RequestWithURIParams<{commentId: string}>, res: Response, next: NextFunction) => {
    /* я уверен в том, что здесь значения будут потому что этот middleware нужно использовать после middleware проверки
    на актуальность токена пользователя */
    const userTokenPayload: accessTokenPayloadType = jwtMethods.compareToken.accessToken(req.headers.authorization!)!;
    const foundedCommentById: commentType | null = await commentsQueryRepository.getCommentByID(req.params.commentId);
    if (foundedCommentById) {
        if (foundedCommentById.userId === userTokenPayload.userId) {
            return next();
        }
        return res.status(403);
    }
    return res.sendStatus(404);
}