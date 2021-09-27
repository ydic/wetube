import mongoose from 'mongoose';

      /*
          // [ Mongoose 문법 ] Javascript 문법인 export, import를 활용해 샵(#) 달아주기 코드를 save와 update 컨트롤 함수에서 불러와 사용해도 되지만, 몽구스 내장함수인 videoSchema.static(이름, 함수)를 활용해서 save와 update 작업에서의 샵(#) 달아주기를 처리할 수도 있다
          export const formatHashtags = (hashtags) => hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`));
      */

const videoSchema = new mongoose.Schema({

  // [ Mongoose 문법 ] db 스키마에서 minlength, maxlength 설정시 사용자와 해당 코드가 제대로 연결되지 않으면 에러 발생할 수 있음. 
  // [ Mongoose 문법 ] PUG 파일(upload.pug)의 HTML form에서도 minlength, maxlength 설정할 수 있는데 굳이 왜 db 스키마에서도 설정해야 할까? 
  // [ Mongoose 문법 ] 정답은 둘 다 해야함 (upload.pug 페이지는 사용자가 개발자 도구로 HTML 재편집해 글자 수 제한이 풀릴 수 있음 / 이런 사용자로부터 사이트를 보호해야 하므로 db 스키마에도 글자 수 제한을 설정해야 함)
  title: {type: String, required: true, trim: true, maxlength: 80},
  description: { type: String, required: true, trim: true, minlength: 10 },
      
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

// [ Mongoose 문법 ] 주의: 미들웨어(Middleware) 코드는 model 코드 이전에 작성되어야 함
// [ Mongoose 문법 ] 미들웨어(Middleware) / pre, post, hook 기능을 통해 object가 db에 저장 및 업데이트 하기 전 또는 후 시점에 사용자의 입력값에 대한 사전처리를 하거나 체크를 해야하는 경우가 있음
// [ Mongoose 문법 ] 미들웨어(Middleware) / pre, post, hook 코드 내에서 this는 저장하려는 문서를 가리킴
// 저장(save) 되기 전에(pre) Middleware(videoSchema)로 호출될 async function

      /*  // 일타이피(즉, save도 처리할 수 있고 update도 처리할 수 있는) 불가한 반쪽 짜리 기능 코드이므로 미사용
          // [ Mongoose 문법 ] Middleware 기능을 하는 videoSchema.pre('save', function(){}) 함수가 가진 기능만으로는 edit(즉, update) 작업에서의 hashtags 샵(#) 달아주기를 해 낼 수 없음
          videoSchema.pre('save', async function(){
            // [ Javascript 문법 ] .split(), .map() 내장함수 체이닝 하지 않은 hashtags에는 사용자가 쉼표(,)로 구분해 입력한 값들이 ['a,b,c']와 같은 array[0] 값(1 string element)으로만 처리 됨
            // 주의 : 본 Middleware 코드(즉, VideoSchema.pre())는 upload 작업에만 유효하므로 edit(즉, update) 작업을 위한 Middleware가 하나 더 필요함
            // 즉, input에 입력된 값이 하나의 emelment로 array에 입력되기 때문에 그 하나의 element(예- ['a,b,c'])를 .split().map() 내장함수를 체이닝시켜서 여러 element를 가진 array로 변환(예- ['a','b','c'])시켜야 함
            this.hashtags = this.hashtags[0].split(',').map((word) => word.startsWith('#') ? word : `#${word}` )
          })
      */

videoSchema.static('formatHashtags', function(hashtags){
  return hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`));
})

// [ Mongoose 문법 ] 주의: model 코드는 미들웨어(Middleware) 코드 이후에 작성되어야 함
const Video = mongoose.model('Video', videoSchema);

export default Video;