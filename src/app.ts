import express from "express";
import {blogsRouter} from "./routes/blogsRouter";

export const app = express();

app.use(express.json());
app.use('/blogs', blogsRouter);
