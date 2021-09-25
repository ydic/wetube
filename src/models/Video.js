import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({

  // [ Mongoose 문법 ] db 스키마에서 minlength, maxlength 설정시 사용자와 해당 코드가 제대로 연결되지 않으면 에러 발생할 수 있음. 
  // [ Mongoose 문법 ] PUG 파일의 HTML form에서도 minlength, maxlength 설정할 수 있는데 굳이 왜 db 스키마에서도 설정해야 할까? 
  // [ Mongoose 문법 ] 정답은 둘 다 해야함 (upload.pug 페이지는 사용자가 개발자 도구로 HTML 재편집해 글자 수 제한이 풀릴 수 있음 / 이런 사용자로부터 사이트를 보호해야 하므로 db 스키마에도 글자 수 제한을 설정해야 함)
  title: {type: String, required: true, trim: true, maxlength: 80},
  description: { type: String, required: true, trim: true, minlength: 20 },
      
  // [ Mongoose 문법 ] createdAt: Date 라고만 스키마를 만들고 { required: true } 속성을 기재하지 않으면 db 형식 코드(사용자 직접 입력하지 않는 자동 값 부여 내장항목 -예: Date)나 사용자 입력값에 대한 데이터 유효성 검사를 할 수 없음
  // [ Mongoose 문법 ] { required: true } 속성을 기재하면 내부 자동 부여 값(예-Date)이든 사용자 입력값이든 유효성 검사 가능해지고 오류가 있는 submit에 대해서는 db에 저장시키지 않음 ValidationError: Video validation failed: createdAt: Path `createdAt` is required.

  // [ Mongoose 문법 ] models/Video.js 에서 db 스키마 설정할 때 createdAt: { type: Date, required: true, default: Date.now }와 같이 default로 Date.now 함수 값 부여하도록 이미 설정했으므로 VideoController.js의 Video.create() 내장함수 내에서 createdAt 값 동작 자체를 처리하지 않아도 됨
  // [ Javascript 문법 ] Date.now()가 아니라 Date.now로 기재한 이유는 바로 실행시키고 싶지 않기 때문 (즉, 새로운 video를 생성했을 때만 mongoose가 Date.now를 실행하도록)
  createdAt: { type: Date, required: true, default: Date.now },
  
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: {type:Number, default:0, required: true},
    rating: {type:Number, default:0, required: true},
  },
});

const Video = mongoose.model('Video', videoSchema);

export default Video;