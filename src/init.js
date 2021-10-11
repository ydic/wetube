import './db';

// ?? 질문: ?? init.js에 db model js파일을 import하는 것이 유효한 코드인가? (nomad 7.0 강의)
// 서버 오류 로그: OverwriteModelError: Cannot overwrite `Video` model once compiled.

// import './models/Video';
// import './models/User';

import app from './server'

const PORT = 4000;
const handleListening = (PORT) => console.log(`Server listening on port ${PORT}`);
// [ Express 문법 ] app.listen() 내장함수가 본 코드 파일에 들어있으므로 package.json 설정에서 단축 실행명령어의 파일 경로를 본 파일 경로로 설정해야 함
app.listen(PORT, handleListening(PORT));

