import {NextFunction, Response} from "express";
import {jwtMethods} from "../routes/application/jwtMethods";
import {userTokenPayloadType} from "../models/tokenModels";
import {commentsQueryRepository} from "../repositories/comments/commentsQueryRepository";
import {RequestWithURIParams} from "../models/reqResModels";
import {commentType} from "../models/commentModel";

export const checkForChangeCommentMiddleware = async (req: RequestWithURIParams<{commentId: string}>, res: Response, next: NextFunction) => {
    try {
        const userTokenPayload: userTokenPayloadType | Error = await jwtMethods.compareUserAuthToken(req.headers.authorization!);
        if ('userId' in userTokenPayload) {
            const foundedCommentByID: commentType | null = await commentsQueryRepository.getCommentByID(req.params.commentId);
            if (foundedCommentByID) {
                if (foundedCommentByID.userId === userTokenPayload.userId) {
                    return next();
                } else {
                    return res.sendStatus(403);
                }
            } else {
                return res.sendStatus(404);
            }
        }
    } catch (e) {
        return res.sendStatus(500);
    }
}