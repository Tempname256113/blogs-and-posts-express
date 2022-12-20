import express, {Request, Response} from "express";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";
import {blogsRepositoryDB} from "./repositories/blogsRepositoryDB";
import {postsRepositoryDB} from "./repositories/postsRepositoryDB";

export const app = express();

app.use(express.json());
app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await Promise.all([blogsRepositoryDB.deleteAllData(), postsRepositoryDB.deleteAllData()])
    res.status(204).end();
})