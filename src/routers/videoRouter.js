import express from "express";

// import 하기 전에 export 처리 먼저 해주어야 함
import {see, edit, deleteVideo, upload} from "../controllers/videoController.js"

export const videoRouter = express.Router();

// Router js, Controller js 코드로 이원화하기 전의 형태
/*
const handleWatch = (req, res) => res.send('Watch Video');
const handleEdit = (req, res) => res.send('Edit Video');
videoRouter.get('/watch', handleWatch);
videoRouter.get('/edit', handleEdit);
*/

// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴

/*
videoRouter.get('/see', see);
videoRouter.get('/edit', edit);
*/

videoRouter.get('/upload', upload);

// [express 문법] URL 안에 변수를 넣도록 해주는 파라미터(예- :id) 
// [express 문법] 파라미터(예- :id) 덕분에 모든 video마다 videoRouter를 새로 만들 필요 없어짐
// 예시: videoRouter.get('/1', see1); videoRouter.get('/2', see2);

// [express 문법] express 입장에서 req가 들어왔을 때, :id 파라미터 변수 다음 줄에 코딩된 URL 값을 :id에 대입시켜버리는 문제 발생함
// [express 문법] 정규표현식 /:id(\\d+) 적용하면 /upload와 같은 라우트 코드가 :id 파라미터 코드보다 아래에 위치해도 문제 없음
// 정규표현식(Regular Expressions): 문자열로부터 특정 정보를 추출해내는 방법
// 숫자 값만 받도록 하는 정규표현식 \d+ 앞에 Javascript 문법 \ 기호를 붙이고 소괄호 쳐서 완성
// 주소에 문자 값 입력해 요청하면 Cannot GET 에러 발생시켜 줌

videoRouter.get('/:id(\\d+)', see);
videoRouter.get('/:id(\\d+)/edit', edit);
videoRouter.get('/:id(\\d+)/delete', deleteVideo);

export default videoRouter;