// server.js는 express 관련, server 환경설정(configuration) 관련 코드만 처리하도록 모듈화

/* NodeJS 문법 require, ES6 문법 import from */
import express from "express";
import morgan from "morgan";

// 하기 코드 형태로 import 가능한 이유는 각 라우터 js파일에서 export default 했기 때문임
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

// const express = require('express');
const app = express();

// morgan도 Middleware에 해당함. 설정을 해줘야 하는 Middleware.
const logger = morgan("dev");

// Request에 대답하기 전까지는 관련된 Contoller가 전부 Middleware (대체로 마지막 함수가 응답)
// app.use는 어느 URL에도 작동하는 Global Middleware (코드 순서: use코드 먼저 get코드 나중)
// 함수가 next()를 호출하면 Middleware 맞음, send()를 호출하면 연결이 중단되므로 Middleware 역할 아님

// express 호환 view engine 종류 (put로 설치)
app.set('view engine', 'pug');

// express 호환 템플리트가 있는 디렉토리
// package.json 파일이 있는 폴더 위치가 pug 템플릿 동작시 인식하는 cwd 기준점
// 따라서 초기 기본값으로 지정된 ./views 경로를 src/views 경로로 변경 (s자 빠진 view로 폴더명 생성시 오류발생함)

// app.set('views', 'src/views');
app.set('views', process.cwd() + '/src/views');


// route들을 사용하기 전에 middleware를 사용해야 함
app.use(logger);

// [ Express 문법 ] express 스스로는 form의 body(즉, value)를 처리할 줄 모름. 
// [ Express 문법 ] route들을 사용하기 전에 middleware를 사용해야 함
// [ Express 문법 ] server.js에서 express.urlencoded() 내장함수를 middleware로써 기능하도록 app.use(urlencoded( { extended: true } )); 라고 코딩하여 express에게 form을 처리하고 싶다고 알려주면 Javascript 형식으로 변형시켜줘서 우리가 사용할 수 있게 됨
app.use(express.urlencoded({extended: true}));

// route들을 사용하기 전에 middleware를 사용해야 함
app.use('/', rootRouter);
app.use('/videos', videoRouter)
app.use('/users', userRouter);

//  초기화 담당하는 init.js에서 express 라이브러리 액세스 할 수 있도록 export 해줌
export default app;