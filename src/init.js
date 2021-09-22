import './db';

import app from './server'

const PORT = 4000;
const handleListening = (PORT) => console.log(`Server listening on port ${PORT}`);
// [ Express 문법 ] app.listen() 내장함수가 본 코드 파일에 들어있으므로 package.json 설정에서 단축 실행명령어의 파일 경로를 본 파일 경로로 설정해야 함
app.listen(PORT, handleListening(PORT));

