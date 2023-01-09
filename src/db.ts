
import {MongoClient} from "mongodb";
import * as dotenv from 'dotenv';
dotenv.config();

// connection URL
// const url = process.env.MONGO_URL;
const url = process.env.MONGO_LOCAL;
if (!url) {
    throw new Error('Url doesn\'t found');
}
export const client = new MongoClient(url);

// database name
const dbName = 'ht02DB';

export const connectionToDB = async () => {
    try {
        //connect the client to the server
        await client.connect();
        //verify connection
        await client.db(dbName).command({ping: 1});
        console.log('connected successfully to mongo server');
    } catch {
        console.log('cant connect to db');
        await client.close();
    }
}