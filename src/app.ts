import express, {Request, Response} from "express";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";
import {blogsRepository} from "./repositories/blogsRepository";
import {postsRepository} from "./repositories/postsRepository";

export const app = express();

app.use(express.json());
app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.delete('/testing/all-data', (req: Request, res: Response) => {
    blogsRepository.deleteAllData();
    postsRepository.deleteAllData();
    res.status(204).end();
})