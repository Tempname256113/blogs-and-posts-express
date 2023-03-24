import {app} from "./app";
import {mongooseConnectToDB} from "./db-mongoose-config";

const port: number = 5000 || process.env.PORT;

app.listen(port, async () => {
    await mongooseConnectToDB();
    console.log(`app listening on port: ${port}`);
});