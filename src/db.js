import mongoose from 'mongoose';

console.log('db.js ---------', process.env.DB_URL);

// DB 연결
// [ dotenv 라이브러리 / Node JS 문법] .env 파일로 별도 관리하는 환경변수값은 process.env.대문자환경변수명 형식으로 호출해 사용할 수 있음
mongoose.connect(process.env.DB_URL);

// DB 액세스
const db = mongoose.connection;

// Mongoose로부터 받은 error 아규먼트
const handleError = (error) => console.log('DB Error', error);

const handleOpen = () => console.log('Connected to DB');

// DB 이벤트 처리
// [Mongoose 문법] on은 여러 번 계속 발생시킬 수 있음 (예- 클릭 이벤트)
db.on('error', handleError);

// [Mongoose 문법] once는 오로지 한 번만 발생함
db.once('open', handleOpen)