
import request from "supertest";

import {app} from "../../app";

describe('general blogs API test', () => {

    it ('should return empty array blogs GET method /blogs',   async() => {
        await request(app)
            .get('/blogs')
            .expect(200, [])
    })

})