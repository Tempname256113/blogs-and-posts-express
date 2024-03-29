import {sign, verify} from "jsonwebtoken";
import {format, millisecondsToSeconds, toDate} from "date-fns";
import {compare, hash, hashSync} from "bcrypt";
import {RequestLimiterDataType} from "./middlewares/request-limiter-middleware";
import {model, Schema} from "mongoose";
import {UserModel} from "./mongoose-db-models/auth-db-models";

// const payload = {payloadProp: 'is string'};
// const jwt = sign(payload, '123', {expiresIn: '1h'});
// console.log(jwt);

// console.log(hashSync('admin', 10))

// try {
//     const jwtPayload = verify(jwt, '123') as { payloadProp: string, iat: number, exp: number };
//     console.log(jwtPayload)
//     const seconds = jwtPayload.iat;
//     console.log(new Date(seconds * 1000));
//     console.log(format(new Date(seconds * 1000), 'PPpp'))
// } catch (e) {
//     console.log('error')
// }

// const pass = 'admin';
// const h = hash(pass, 10, (err, encrypted) => {
//     if (err) {
//         console.log('err: ' + err)
//     }
//     console.log('hash: ' + encrypted);
// });
//
// const compPromise = compare(pass, '$2b$10$ItmUS/Uob0s6QrSs414KY..elSedRsq28tWgpyQeTjjg0HLf3IIrS');
// compPromise.then((data) => {
//     console.log(data);
// })
// .catch((data) => {
//     console.log(data);
// })
//
// console.log(format(new Date(1676820306193), 'PPpp'))

// const usersCollection = db.collection('sessions');
// const t = async () => {
//     const updatedSession = await usersCollection.updateOne(
//         {deviceId: 'fd2f5e1a-a74e-4faf-8a61-397e9446ade5'},
//         { $set: {userDeviceName: 'example device name'}
//         });
//     console.log(updatedSession);
// }
//
// t();