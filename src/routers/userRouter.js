import express from "express";

// import 하기 전에 export 처리 먼저 해주어야 함
import {edit, remove, logout, see, startGithubLogin, finishGithubLogin} from "../controllers/userController.js"

const userRouter = express.Router();

// Router js, Controller js 코드로 이원화하기 전의 형태
/*
const handleEdit = (req, res) => res.send("Edit User");
const handleDelete = (req, res) => res.send("Delete User");
userRouter.get("/edit", handleEdit);
userRouter.get("/delete", handleDelete);
*/

userRouter.get("/edit", edit);
userRouter.get("/delete", remove);
userRouter.get("/logout", logout);

userRouter.get('/github/start', startGithubLogin)

// [ Github OAuth API 문법] 깃허브 OAuth 생성페이지(https://github.com/settings/applications/new)에서 Authorization callback 주소로 /github/finish 지정했기에 Github에서 받은 토큰이 이 단계의 코드 거쳐 access_token 으로 변환됨
userRouter.get('/github/finish', finishGithubLogin)

// [express 문법] express 입장에서 req가 들어왔을 때, :id 파라미터 변수 다음 줄에 코딩된 URL 값을 :id에 대입시켜버리는 문제 발생함
// [express 문법] 정규표현식 /:id(\\d+) 적용하면 /upload와 같은 라우트 코드가 :id 파라미터 코드보다 아래에 위치해도 문제 없음
// 정규표현식(Regular Expressions): 문자열로부터 특정 정보를 추출해내는 방법
// 숫자 값만 받도록 하는 정규표현식 \d+ 앞에 Javascript 문법 \ 기호를 붙이고 소괄호 쳐서 완성
// 주소에 문자 값 입력해 요청하면 Cannot GET 에러 발생시켜 줌

userRouter.get("/:id(\\d+)", see);


export default userRouter;