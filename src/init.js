// [ dotenv 라이브러리 문법 ] .gitignore 파일에 .env를 표기해야 함(대외비이므로)
// [ dotenv 라이브러리 문법 ] .emv 파일을 package.json과 동일 폴더 계층에 두어야 함
// [ dotenv 라이브러리 문법 ] 전체 코드의 최우선 순위로 dotenv 라이브러리를 인식시켜야.env 파일에 별도 저장한 기밀 값들을 process.env. 문법을 통해 각 코드 파일들에서 불러와 각종 기능을 원활히 작동시킬 수 있음
// [ dotenv 라이브러리 문법 & Javascript 문법 ] require 방식은 특정 라이브러리를 사용하고 싶은 모든 js 파일 상단부에 require 표기해야 함
            // require('dotenv').config();
import 'dotenv/config';

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

