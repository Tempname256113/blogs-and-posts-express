import * as mongoose from "mongoose";
import * as dotenv from 'dotenv';

dotenv.config();

const dbName = 'ht02DB';

// const mongoURI = process.env.MONGO_URL;
const mongoURI = `${process.env.MONGO_LOCAL}/${dbName}`;

if (!mongoURI) {
    throw new Error('Url doesn\'t found');
}

export const mongooseConnectToDB = async () => {
    await mongoose.connect(mongoURI);
    console.log('connected successfully to mongo server');
};