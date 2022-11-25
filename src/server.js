// server.js는 express 관련, server 환경설정(configuration) 관련 코드만 처리하도록 모듈화

// Node JS는 Browser 밖에서도 동작하는 Javascript 이다
// Babel은 Node JS가 이해하지 못하는 최신 Javascript를 이해하고 실행하도록 도와준다.
// npm install --save-dev nodemon @babel/core @babel/preset-env @babel/node

/* NodeJS 문법 require, ES6 문법 import from */
import express from "express";
import morgan from "morgan";

// [ Express-session 라이브러리 문법 ] session과 cookie 설정을 위한 라이브러리 설치(npm i express-session) 및 호출
import session from "express-session";

// [ connect-mongo 라이브러리 문법 ]
import MongoStore from "connect-mongo";

// 하기 코드 형태로 import 가능한 이유는 각 라우터 js파일에서 export default 했기 때문임
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";

// const express = require('express');
const app = express();

// morgan도 Middleware에 해당함. 설정을 해줘야 하는 Middleware.
const logger = morgan("dev");

// Request에 대답하기 전까지는 관련된 Contoller가 전부 Middleware (대체로 마지막 함수가 응답)
// app.use는 어느 URL에도 작동하는 Global Middleware (코드 순서: use코드 먼저 get코드 나중)
// 함수가 next()를 호출하면 Middleware 맞음, send()를 호출하면 연결이 중단되므로 Middleware 역할 아님

// express 호환 view engine 종류 (put로 설치)
app.set("view engine", "pug");

// express 호환 템플리트가 있는 디렉토리
// package.json 파일이 있는 폴더 위치가 pug 템플릿 동작시 인식하는 cwd 기준점
// 따라서 초기 기본값으로 지정된 ./views 경로를 src/views 경로로 변경 (s자 빠진 view로 폴더명 생성시 오류발생함)

// app.set('views', 'src/views');
app.set("views", process.cwd() + "/src/views");

// route들을 사용하기 전에 middleware를 사용해야 함
app.use(logger);

// [ Express 문법 ] express 스스로는 form의 body(즉, value)를 처리할 줄 모름.
// [ Express 문법 ] route들을 사용하기 전에 middleware를 사용해야 함
// [ Express 문법 ] server.js에서 express.urlencoded() 내장함수를 middleware로써 기능하도록 app.use(urlencoded( { extended: true } )); 라고 코딩하여 express에게 form을 처리하고 싶다고 알려주면 Javascript 형식으로 변형시켜줘서 우리가 사용할 수 있게 됨
// [ express ] This object will contain key-value pairs, where the value can be a string or array (when extended is false), or any type (when extended is true).
app.use(express.urlencoded({ extended: true }));

// console.log('server.js ------', process.env.COOKIE_SECRET);

// [ Express-session 라이브러리 문법 ] cookie는 백엔드가 브라우저에게 부여하는 식별 정보 (주의: cookie 안에 Session ID가 저장됨. 브라우저의 cookie는 Session ID(브라우저 고유 식별값)를 전송하는데 사용됨)
// [ Express-session 라이브러리 문법 ] 백엔드와 브라우저 간의 영구적인 연결이 보장되는 것이 아니므로(즉, statless / 즉, 응답(res) 마치면 서버와 브라우저 간 연결 끊김) Session ID로 로그인한 사용자 식별요
// [ Express-session 라이브러리 문법 ] Session ID를 가지고 있으면 Session object에 정보를 추가(예- req.session.숫자, req.session.사용자ID 등) 할 수 있음
// [ Express-session 라이브러리 문법 ] route들을 사용하기 전에 middleware를 사용해야 함. (즉, 서버는 session middleware를 통해 브라우저에 cookie를 발행하여 사이트로 들어와 자기(서버)한테 요청하는 모두(비로그인 사용자 포함)를 식별하게 됨)
app.use(
  session({
    // [ dotenv 라이브러리 문법 ] 전체 코드의 최우선 순위(본 프로젝트는 app.listen(PORT, handleListening(PORT)); 코드가 있는 init.js 파일)로 dotenv 라이브러리를 인식시켜야.env 파일에 별도 저장한 기밀 값들을 process.env.키값 문법을 통해 각 코드 파일들에서 불러와 각종 기능을 원활히 작동시킬 수 있음
    // [ dotenv 라이브러리 문법 & Javascript 문법 ] require 방식은 특정 라이브러리(예: prcess.env.대문자환경변수를 사용하도록 하는 dotenv)를 사용하고 싶은 각각의 모든 js 파일 상단부에 require 표기해야 하는 번거로운 점이 있음
    // [ dotenv 라이브러리 / Node JS 문법] .env 파일로 별도 관리하는 환경변수값은 process.env.대문자환경변수명 형식으로 호출해 사용할 수 있음
    // [ dotenv 라이브러리 / Node JS 문법] dotenv 라이브러리 미설치 상태로 process.env.대문자환경변수 코드 실행하면 cannot init client 오류 발생함. 해당 코드 윗단에 console.log(.env 파일에 지정한 대문자환경변수) 확인하면 undefined 로 나타남.
    secret: process.env.COOKIE_SECRET,

    // 서버로그 경고 알림: express-session deprecated undefined resave option; provide resave option src\server.js:53:40
    // 서버로그 경고 알림: express-session deprecated undefined saveUninitialized option; provide saveUninitialized option src\server.js:53:40

    // resave: true,
    // saveUninitialized: true,

    resave: false,

    // [ Express-session 라이브러리 연계 문법 ] saveUninitialized: false 지정했으므로 본 프로젝트 코드의경우 backend가 로그인한 사용자(익명사용자 X)에게만 쿠키를 주도록 설정됨. 세션을 수정할 때만 세션을 DB에 저장하고 쿠키를 넘겨주도록 함
    // [ Express-session 라이브러리 연계 문법 ] (즉, UserController.js 내의 postLogin 함수에서 req.session.loggedIn = true; 와 req.session.userDbResult = userDbResult; 코드를 통해서 세션 수정됨)
    // [ Express-session 라이브러리 연계 문법 ] session 인증의 문제점은 backend가 DB에 저장한다는 것임. 브라우저는 쿠키 이용한 세션 인증과 토큰 인증 적용 가능. 보완책으로는 iOS/안드로이드 앱 제작시 토큰(Token) 인증 방식이 활용됨.
    saveUninitialized: false,

    // [ connect-mongo 라이브러리 문법 ] connect-mongo 라이브러리를 .create({}) 하면 session들이 MongoDB에 저장 가능해짐
    // [ dotenv 라이브러리 / Node JS 문법] .env 파일로 별도 관리하는 환경변수값은 process.env.대문자환경변수명 형식으로 호출해 사용할 수 있음
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),

    // [ Express-session 라이브러리 연계 문법 ] cookie: { maxAge: 1/1000초 단위 } 설정으로 쿠키 유지 기간 설정 가능
    // cookie: {
      //   maxAge: 10000,
      // }
    })
  );

// [ Express-session 라이브러리 연계 문법 ] locals를 통해 누가 로그인했는지 공유함 (Pug와 Express가 서로 res.locals 값을 공유할 수 있도록(즉, res.render 없이도 Pug 템플릿 쪽으로 변수롤 전역적으로 보낼 수 있음) 기본 설정되어 있음)
// 주의: server.js에서 localsMiddleware가 코드 순서상 Express-session middleware ( 즉, app.use(session({}) )다음에 오기 때문에 가능함
// 주의: middlewares.js의 localMiddleware 함수는 session 오브젝트를 받아와야 그 값을 기반으로 res.locals. 값을 생성해 Pug 템플릿에서도 전역으로 값을 받아와 사용 가능해짐
app.use(localsMiddleware);
    
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




// route들을 사용하기 전에 middleware를 사용해야 함
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

// [ 시큐어 보안 코딩 & Express 라이브러리 문법 ] 브라우저가 uploads 폴더에 있는 파일 내용을 볼 수 있도록 route 경로 설정
// [ 시큐어 보안 코딩 & Express 라이브러리 문법 ] 브라우저가 서버의 어떤 폴더로든 아무런 제한 없이 접근하는 것은 보안에 취약함
// [ 시큐어 보안 코딩 & Express 라이브러리 문법 ] express.static('노출시키려는 폴더명') 라는 코드를 통해 일명 static files serving 기능을 가동해 브라우저가 열람 가능한 페이지와 폴더를 지정해 놓는 것이 보안에 바람직함
// [ 시큐어 보안 코딩 & Express 라이브러리 문법 ] express.static('노출시키려는 폴더명') 라는 코드가 반영된 접근경로 폴더의 파일들에는 확장자가 없어서 브라우저가 해당 파일을 다운로드 하려고 함
app.use("/uploads", express.static("uploads"));

// [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 ] webpack.config.js 설정을 마쳤다면 server.js 에서 express.static('노출시키려는 폴더명') 코드로 Express를 통해 assets 폴더 공개하기 (즉, 기본적으로 폴더들은 비공개이므로)
app.use("/static", express.static("assets"));

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
