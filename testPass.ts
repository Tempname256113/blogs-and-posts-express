// import {compare, genSalt, hash} from "bcrypt";
//
// const password = 'passwordTest123';
// const password2 = 'passwordTest123';
//
// async function createPass(){
//     const salt1 = await genSalt(10);
//     const salt2 = await genSalt(10);
//     // return {
//     //     pass1: await hash(password, salt),
//     //     pass2: await hash(password2, salt),
//     // };
//     console.log(salt1, salt2);
//     return hash(password, salt1);
// }
//
// async function createPass2(){
//     const salt = await genSalt(10);
//     return hash(password2, salt);
// }
//
// async function checkPass(){
//     const pass1 = await createPass();
//     const pass2 = await createPass2();
//     const check = await compare('passwordTest123', pass1);
//     const check2 = await compare('passwordTest123', pass2);
//     // console.log(check, check2);
//     console.log(pass1, pass2);
// }
//
// checkPass();

// genSalt(10, 'b', (err, salt) => {
//     console.log(salt);
// })
