import express from "express";

// import 하기 전에 export 처리 먼저 해주어야 함
import {watch, getEdit, postEdit, getUpload, postUpload, deleteVideo} from "../controllers/videoController.js"
import { videoUpload, protectorMiddleware } from '../middlewares.js';

export const videoRouter = express.Router();

// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴

// [express 문법] URL 안에 변수를 넣도록 해주는 파라미터(예- :id) 
// [express 문법] 파라미터(예- :id) 덕분에 모든 video마다 videoRouter를 새로 만들 필요 없어짐
// 예시: videoRouter.get('/1', see1); videoRouter.get('/2', see2);

// [express 문법] express 입장에서 req가 들어왔을 때, :id 파라미터 변수 다음 줄에 코딩된 URL 값을 :id에 대입시켜버리는 문제 발생함
// [express 문법] 정규표현식 /:id(\\d+) 적용하면 /upload와 같은 라우트 코드가 :id 파라미터 코드보다 아래에 위치해도 문제 없음
// 정규표현식(Regular Expressions): 문자열로부터 특정 정보를 추출해내는 방법
// 숫자 값만 받도록 하는 정규표현식 \d+ 앞에 Javascript 문법 \ 기호를 붙이고 소괄호 쳐서 완성
// 주소에 문자 값 입력해 요청하면 Cannot GET 에러 발생시켜 줌

// [ MongoDB 문법 ] ObjectID()는 24 byte hex string(24바이트 16진수)로 정의되어 있음
// 정규표현식 테스트 사이트 https://regexr.com/
// [0-9a-f]{24} 정규표현식의 의미는 0부터 9, a부터 f까지의 24자(24바이트 16진수) string을 찾아내는 것

                // videoRouter.get('/:id(\\d+)', watch)

videoRouter.get('/:id([0-9a-f]{24})', watch);

// [ Express 문법 ] express 스스로는 form의 body(즉, value)를 처리할 줄 모름. 
// [ Express 문법 ] route들을 사용하기 전에 middleware를 사용해야 함
// [ Express 문법 ] server.js에서 express.urlencode() 내장함수를 middleware로써 기능하도록 app.use(urlencoded( { extended: true } )); 라고 코딩하여 express에게 form을 처리하고 싶다고 알려주면 Javascript 형식으로 변형시켜줘서 우리가 사용할 수 있게 됨

                // videoRouter.route('/:id(\\d+)/edit').get(getEdit).post(postEdit);

// [ 코드 연계성 ] video model과 user model을 연결(즉, videoController 에서 video 마다 소유자를 지정해 소유자(wetube db 계정이 있고, 로그인 상태인 사용자 - 즉, middlewares.js 의 protectorMiddleware 함수에 부합하는 사용자)에게만 video 업로드 권한 부여, 해당 소유자가 아니라면 video 수정 및 삭제 권한 접근제한)
videoRouter.route('/:id([0-9a-f]{24})/edit').all(protectorMiddleware).get(getEdit).post(postEdit);
videoRouter.route('/:id([0-9a-f]{24})/delete').all(protectorMiddleware).get(deleteVideo);

videoRouter.route('/upload').all(protectorMiddleware).get(getUpload).post(videoUpload.single('videoByMulter'), postUpload);

export default videoRouter;