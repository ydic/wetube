// server.js는 express 관련, server 환경설정(configuration) 관련 코드만 처리하도록 모듈화

/* NodeJS 문법 require, ES6 문법 import from */
import express from "express";
import morgan from "morgan";

// [ Express-session 라이브러리 문법 ] session과 cookie 설정을 위한 라이브러리 설치(npm i express-session) 및 호출
import session from "express-session";

// [ connect-mongo 라이브러리 문법 ]
import MongoStore from "connect-mongo";

// 하기 코드 형태로 import 가능한 이유는 각 라우터 js파일에서 export default 했기 때문임
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';
import { localsMiddleware } from './middlewares';

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

// console.log('server.js ------', process.env.COOKIE_SECRET);

// [ Express-session 라이브러리 문법 ] cookie는 백엔드가 브라우저에게 부여하는 식별 정보 (주의: cookie 안에 Session ID가 저장됨. 브라우저의 cookie는 Session ID(브라우저 고유 식별값)를 전송하는데 사용됨)
// [ Express-session 라이브러리 문법 ] 백엔드와 브라우저 간의 영구적인 연결이 보장되는 것이 아니므로(즉, statless / 즉, 응답(res) 마치면 서버와 브라우저 간 연결 끊김) Session ID로 로그인한 사용자 식별요
// [ Express-session 라이브러리 문법 ] Session ID를 가지고 있으면 Session object에 정보를 추가(예- req.session.숫자, req.session.사용자ID 등) 할 수 있음
// [ Express-session 라이브러리 문법 ] route들을 사용하기 전에 middleware를 사용해야 함. (즉, 서버는 session middleware를 통해 브라우저에 cookie를 발행하여 사이트로 들어와 자기(서버)한테 요청하는 모두(비로그인 사용자 포함)를 식별하게 됨)
app.use(session({
  // [ dotenv 라이브러리 / Node JS 문법] .env 파일로 별도 관리하는 환경변수값은 process.env.대문자환경변수명 형식으로 호출해 사용할 수 있음
  secret: process.env.COOKIE_SECRET,
  
            // 서버로그 경고 알림: express-session deprecated undefined resave option; provide resave option src\server.js:53:40
            // 서버로그 경고 알림: express-session deprecated undefined saveUninitialized option; provide saveUninitialized option src\server.js:53:40
  
  // resave: true,
  // saveUninitialized: true,

  resave: false,
  saveUninitialized: false,

  // [ connect-mongo 라이브러리 문법 ] connect-mongo 라이브러리를 .create({}) 하면 session들이 MongoDB에 저장 가능해짐
  // [ dotenv 라이브러리 / Node JS 문법] .env 파일로 별도 관리하는 환경변수값은 process.env.대문자환경변수명 형식으로 호출해 사용할 수 있음
  store: MongoStore.create({mongoUrl: process.env.DB_URL}),

}))

        // [ Express-session 라이브러리 연계 문법 ] session을 메모리에 저장하는 경우, 서버 재시작하면 req.sessionStore.all((error, sessions) => {}) 코드에 잡히는 모든 세션 로그값이 휘발되어 버림 (따라서 back-end가 session을 기억(? req에 담긴 cookie)하도록 session을 MongoDB와 연결요)
        /*
        app.use((req, res, next) => {
          console.log('cookie는 req.headers.cookie에 담겨서 서버로 보내진다 -------', req.headers.cookie);
          
          console.log('locals는 res 오브젝트 내에 있다(즉, res.locals) --------', res.locals);
          
          // req.sessionStore는 메모리 저장 방식이므로 서버 재시작하면 휘발되어 정보가 없어짐 (따라서 Express-session과 Connect-mongo 라이브러리를 활용해 session을 MongoDB와 연결요)
          req.sessionStore.all((error, sessions) => {
            console.log('백엔드가 메모리 상에 기억하고 있는 session 정보들 (req.sessionStore 속에 담겨있음)--------', sessions);
            
            // 함수가 next()를 호출하면 Middleware 맞음, send()를 호출하면 연결이 중단되므로 Middleware 역할 아님
            next();
          })
        })
        */

// [ Express-session 라이브러리 연계 문법 ] locals를 통해 누가 로그인했는지 공유함 (Pug와 Express가 서로 res.locals 값을 공유할 수 있도록(즉, res.render 없이도 Pug 템플릿 쪽으로 변수롤 전역적으로 보낼 수 있음) 기본 설정되어 있음)
// 주의: server.js에서 localsMiddleware가 코드 순서상 Express-session middleware ( 즉, app.use(session({}) )다음에 오기 때문에 가능함
// 주의: middlewares.js의 localMiddleware 함수는 session 오브젝트를 받아와야 그 값을 기반으로 res.locals. 값을 생성해 Pug 템플릿에서도 전역으로 값을 받아와 사용 가능해짐
app.use(localsMiddleware);

// route들을 사용하기 전에 middleware를 사용해야 함
app.use('/', rootRouter);
app.use('/videos', videoRouter)
app.use('/users', userRouter);


        // [ Express-session 라이브러리 연계 문법 ] 서버가 브라우저에게 부여하는 Session ID 확인해보기
        // Session ID를 가지고 있으면 Session object에 정보를 추가(예- req.session.숫자, req.session.사용자ID 등) 할 수 있음
        /*
        app.get('/add-one',(req, res, next) => {
          req.session.potato += 1;
          return res.send(`aaa ${req.session.id}\n${req.session.potato}`);
        })
        */

//  초기화 담당하는 init.js에서 express 라이브러리 액세스 할 수 있도록 export 해줌
export default app;