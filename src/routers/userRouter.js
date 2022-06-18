import express from "express";

// import 하기 전에 export 처리 먼저 해주어야 함
import {getChangePassword, postChangePassword, getEdit, postEdit, remove, logout, see, startGithubLogin, finishGithubLogin} from "../controllers/userController.js"

// [ Express 라이브러리 문법 ] ReferenceError: protectorMiddleware is not defined (middlewares.js 에서 export 한 함수를 userRouter.js 에서 사용하려는 것이므로 import 해주어야 함)
import { avatarUpload, protectorMiddleware, publicOnlyMiddleware } from '../middlewares.js';

const userRouter = express.Router();

// Router js, Controller js 코드로 이원화하기 전의 형태
/*
const handleEdit = (req, res) => res.send("Edit User");
const handleDelete = (req, res) => res.send("Delete User");
userRouter.get("/edit", handleEdit);
userRouter.get("/delete", handleDelete);
*/

// [ Express 라이브러리 문법 ] GET/POST 요청에 대한 라우팅 코드 구성시 홑따옴표 .get('함수명') 형태로 표기하면 문법오류 발생하므로 홑따옴표 없이 함수명 기재요망
// [ Express 라이브러리 문법 ] Error: Route.get() requires a callback function but got a [object String]
// [ 코드 연게성 ] server.js 에서 카테고리 분류 목적으로 라우팅 ->UserRouter.js 에서 페이지 경로 라우팅 -> pug (예- base.pug) 에서 a(href="페이지 경로")로 연결 -> GET/POST 요청 방식에 따라 userRouter.js 에서 세팅된 라우팅 경로에 맞춰 userController.js 의 해당함수로 연결 -> 함수에서 return res.status().render() 또는 return res.redirect 
// [ 시큐어 보안 코딩 ] 비로그인 상태의 사용자가 로그인 된 사용자에게만 보이는 Edit-Profile 하이퍼링크도 브라우저에 나타나지 않는 상황에서 사용자 정보 변경 페이지 URL 값을(즉, /users/edit) 직접 주소입력창에 입력하여 진입 시도하면 해당 URL 경로에 대한 접근을 제한시켜야 함(예- 리다이렉트 시키기)
// [ 시큐어 보안 코딩 & Express-session 라이브러리 연계 문법 ] loggedInUserDb 에 접근하려는데 비로그인 상태이면 발생하는 에러에 대해 req.session.userDbResult || {}; 코드는 or 조건자와 빈 오브젝트(즉, {}, empty object) 를 덧붙여서 session 내의 user 값이 비어있는 상태일 때(즉, 사이트 방문자가 비로그인 상태일 때) loggedInUser 값이 undefined 여서 발생하게 되는 cannot read property '무언가' of undefined 오류를 방지할 수 있음
// [ 시큐어 보안 코딩 ] middlewares.js 의 protectorMiddleware 함수로 비로그인 사용자가 로그인 승인 필요한 페이지(로그인된 사용자 전용)에 접근하지 못하도록 제한하기
// [ Express 라이브러리 문법 ] .all(함수명) 문법을 통해 GET/POST/PUT/DELETE 요청 구분 없이 모든 http method 요청에 대해 .all( ) 로 지정한 함수를 거친 다음에 Controller 함수 쪽으로 넘어가도록 만듦

// [ Multer 라이브러리 문법 ] POST 요청에 대해 postEdit 함수 기재 이전에 Multer (즉, avatarUpload.single('avatarByMulter') 라는 코드)를 먼저 기재하여 Multer 코드 실행 후 그 다음 controller 인 postEdit 에 업로드한 파일의 정보를 전달함
// [ Multer 라이브러리 문법 ] 즉, postEdit을 먼저 기재했다면 Multer 라이브러리의 req.file 기능 사용 불가함
// [ Multer 라이브러리 문법 ★★★ ] avatarUpload.single('avatarByMulter') 코드는 edit-profile.pug 의 form(method='POST', enctype='multipart/form-data') 입력폼 내의 avatar 라는 이름의 input(type='file') 값에 단일 파일(즉, single)을 담아 uploads 폴더 이하에 업로드하고 req.file 을 추가함
userRouter.route('/edit').all(protectorMiddleware).get(getEdit).post(avatarUpload.single('avatarByMulter'), postEdit);

userRouter.route('/change-password').all(protectorMiddleware).get(getChangePassword).post(postChangePassword);

userRouter.get("/logout", protectorMiddleware, logout);

userRouter.get("/delete", remove);

// [ 시큐어 보안 코딩 ] middlewares.js 의 publicOnlyMiddleware 함수를 통해 이미 로그인한 사용자(즉, loggedIn 값이 true)라면 로그인 처리용 URL 경로들에 접근 시도하는 것은 불필요한 접근이므로 접근 제한시킴
userRouter.get('/github/start', publicOnlyMiddleware, startGithubLogin)

// [ 시큐어 보안 코딩 ] middlewares.js 의 publicOnlyMiddleware 함수를 통해 이미 로그인한 사용자(즉, loggedIn 값이 true)라면 로그인 처리용 URL 경로들에 접근 시도하는 것은 불필요한 접근이므로 접근 제한시킴
// [ Github OAuth API 문법] 깃허브 OAuth 생성페이지(https://github.com/settings/applications/new)에서 Authorization callback 주소로 /github/finish 지정했기에 Github에서 받은 토큰이 이 단계의 코드 거쳐 access_token 으로 변환됨
userRouter.get('/github/finish', publicOnlyMiddleware, finishGithubLogin)

// [express 문법] express 입장에서 req가 들어왔을 때, :id 파라미터 변수 다음 줄에 코딩된 URL 값을 :id에 대입시켜버리는 문제 발생함
// [express 문법] 정규표현식 /:id(\\d+) 적용하면 /upload와 같은 라우트 코드가 :id 파라미터 코드보다 아래에 위치해도 문제 없음
// 정규표현식(Regular Expressions): 문자열로부터 특정 정보를 추출해내는 방법
// 숫자 값만 받도록 하는 정규표현식 \d+ 앞에 Javascript 문법 \ 기호를 붙이고 소괄호 쳐서 완성
// 주소에 문자 값 입력해 요청하면 Cannot GET 에러 발생시켜 줌

// [ 시큐어 보안 코딩 ] 로그인 여부가 중요하지 않은 중립적 성격의 함수이므로 해당 URL에 대한 별도의 접근 제한을 두지 않음
userRouter.get("/:id(\\d+)", see);

export default userRouter;