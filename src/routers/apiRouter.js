import express from 'express';
import { registerView, createComment, deleteComment } from '../controllers/videoController';

// [ Web API & Express 문법 ] API 통신 기법은 백엔드가 템플릿을 렌더링 하지 않더라도 프론트엔드와 백엔드 간의 통신하는 방법
const apiRouter = express.Router();

// [ Express 문법 ] form 태그에 의존하지 않고 독자적으로 POST 요청하여 영상 시청 완료에 따른 조회수 증가 시키기
// 프론트엔드에서 자바스크립트로 호출하는 URL
apiRouter.post('/videos/:id([0-9a-f]{24})/view', registerView)

apiRouter.post('/videos/:id([0-9a-f]{24})/comment', createComment)

// [ Express 문법 ] watch.pug 에 대한 commentSection.js 내의 RequestDeleteComment 함수에서 fetch() 통한 DELETE 요청 발생시 서버단의 videoController.js 의 deleteComment 함수 실행으로 연결해주는 라우터
apiRouter.delete('/videos/:id([0-9a-f]{24})/comment', deleteComment)

export default apiRouter;