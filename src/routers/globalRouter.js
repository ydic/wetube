import express from "express";

// import 하기 전에 export 처리 먼저 해주어야 함
import {home, search} from "../controllers/videoController.js"
import {join, login} from "../controllers/userController.js"

const globalRouter = express.Router();

// Router 코드와 Controller 코드의 이원화 필요
// Controller는 함수이고 Router는 그 함수를 이용하는 관계

// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴

// 루트 주소로의 GET 요청은 videoController 쪽에서 처리하여 응답하도록 코딩함
globalRouter.get("/", home);

// join 주소로의 GET 요청은 userController 쪽에서 처리하여 응답하도록 코딩함
globalRouter.get("/join", join);

globalRouter.get("/login", login);
globalRouter.get("/search", search);

export default globalRouter;