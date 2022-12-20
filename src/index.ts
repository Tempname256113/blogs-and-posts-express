
import {app} from "./app";
import {connectionToDB} from "./db";

const port: number = 3000 || process.env.PORT;

app.listen(port, async () => {
    await connectionToDB();
    console.log(`app listening on port: ${port}`);
});