/* NodeJS 문법 require, ES6 문법 import from */
import express from "express";
import morgan from "morgan";

// 하기 코드 형태로 import 가능한 이유는 각 라우터 js파일에서 export default 했기 때문임
import globalRouter from './routers/globalRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

// const express = require('express');
const app = express();

// morgan도 Middleware에 해당함. 설정을 해줘야 하는 Middleware.
const logger = morgan("dev");

// Request에 대답하기 전까지는 관련된 Contoller가 전부 Middleware (대체로 마지막 함수가 응답)
// app.use는 어느 URL에도 작동하는 Global Middleware (코드 순서: use코드 먼저 get코드 나중)
// 함수가 next()를 호출하면 Middleware 맞음, send()를 호출하면 연결이 중단되므로 Middleware 역할 아님

app.use(logger);

app.use('/', globalRouter);
app.use('/video', videoRouter)
app.use('/user', userRouter);

const PORT = 5500;
const handleListening = (PORT) => console.log(`Server listening on port ${PORT}`);
app.listen(PORT, handleListening(PORT));

