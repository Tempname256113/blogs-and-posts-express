
import {app} from "./app";

const port: number = 3000 || process.env.PORT;

app.listen(port, () => {
    console.log(`app listening on port: ${port}`);
});