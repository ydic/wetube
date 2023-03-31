import express from 'express';
import { registerView } from '../controllers/videoController';

// [ Web API & Express 문법 ] API 통신 기법은 백엔드가 템플릿을 렌더링 하지 않더라도 프론트엔드와 백엔드 간의 통신하는 방법
const apiRouter = express.Router();

// [ Express 문법 ] form 태그에 의존하지 않고 독자적으로 POST 요청하여 영상 시청 완료에 따른 조회수 증가 시키기
// 프론트엔드에서 자바스크립트로 호출하는 URL
apiRouter.post('/videos/:id([0-9a-f]{24})/view', registerView)

export default apiRouter;