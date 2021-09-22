import mongoose from 'mongoose';

// DB 연결
mongoose.connect('mongodb://127.0.0.1:27017/wetube');

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