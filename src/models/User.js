import mongoose from 'mongoose';

// [ Bcrypt 라이브러리 문법 ] 설치 명령어는 npm i bcrypt 이며 hacker가 rainbow table 공격을 bcrypt 라이브러리 적용을 통해 막을 수 있음 (secure code 보안 코드 확인요)
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({

  // [ Mongoose 연계 문법 ] Relationship 작업B - 1차버전장황코드) 사용자가 업로드한 모든 video 목록 보여주기: 사용자의 _id 를 owner 로 가진 video list(즉, 여러 개의 video 목록) 찾기 (userController.js 의 see 함수 내의 const videos = await Video.find({ owner: userProfileDbResult._id}); 코드로 처리)
  // [ Mongoose 연계 문법 ] Relationship 작업B - 2차버전간결코드) 1차버전장황코드 DB 초기화 선행요 / 사용자가 업로드한 모든 video 목록 보여주기: User 모델에 video list(즉, 여러 개의 video 목록) 양단 연결하는 array 형식의 스키마 추가요
  // [ Mongo DB & Mongoose 연계 문법 ★★★] 이처럼 Video 모델과 User 모델을 연결하는 스키마와 controller 를 만들려면 우선적으로 mongo 콘솔 명령어 db.users.remove({}) 와 db.videos.remove({}) 를 실행해 두 개의 collection (즉, users 와 videos) 를 모두 삭제(즉, 초기화) 해야 함

  // [ Github OAuth API 문법 ] 사용자가 Github로 로그인했는지 여부를 확인하기 위함 / 로그인 페이지에서 사용자가 email로 로그인하려는데 password 없을 때 이를 대신해 github 로그인 상태를 확인해 볼 수 있음
  // [ Github OAuth API 문법 ] 사용자가 로그인 페이지에서 사이트ID(본 프로젝트에서는 email)/PW로 로그인하려는데 password가 없을 때 (즉, github OAuth 방식 가입자) socialOnly 값이 기본값 false 에서 userController.js 내의 finishGithubLogin 함수 내의 User.create({socialOnly:true}) 로 처리된 경우 wetube 로그인 승인 처리하기 위한 용도의 식별자
  socialOnly: {type: Boolean, default: false},

  // [ Github OAuth API 문법 ] userController.js 의 finishGithubLogin 함수에서 access_token 을 서버단의 nodejs (즉, node-fetch 라이브러리 기반) 에서 fetch 하여 Github 측으로부터 최종적으로 받아온 사용자 정보가 들어있는 userData 값 내부에 들어있는 avatar_url 값을 읽어와 사용자가 등록한 사진(즉, 프로필 사진)을 보여주기 위함
  // [ Github OAuth API 문법 ] wetube 프로젝트 기준으로는 avatarUrl 값(즉, github 에서 받아온 avatar_url 값)이 없는 사용자는 wetube ID/PW 로만 계정을 만든 경우에 해당함
  avatarUrl: String,

  name: { type: String, required: true },
  // [ Mongoose 문법 ] Schema 지정시 unique 속성 지정하여 고유 인덱스로 만듦
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  
  // [ Github OAuth API 문법 ] Github 를 이용해 계정 생성한 경우, password 값은 다뤄지지 않아 없으므로 username 와 password 키를 활용한 form 을 이용할 수 없음
  // [ Github OAuth API 문법 ] password 항목의 required: 속성을 해제해야 정상 동작함 (일부 사용자들에게는 password 가 없을 수도 있기 때문)
  // [ Github OAuth API 문법 ] ★★★ 프론트앤드 단의 join.pug 와 login.pug 에서 input(중략 type='password', required) 라고 설정해도 백엔드 DB 단에서 password 항목의 required: 속성이 해제 되어 있기에 암호 미입력 상태임에도 엉터리 DB 스키마 구성으로 인해 가입이 되고, 로그인 시도시에는 생성한 적 없는 암호를 요구하는 이상한 모양새로 동작하게 됨
  password: { type: String },
      // 오류메시지: UnhandledPromiseRejectionWarning: ValidationError: User validation failed: password2: Path `password2` is required.
      // password2: { type: String, required: true },
  location: { type: String },
});

// [ Mongoose 문법 ] join.pug의 input 태그에서 submit한 내용이 User.create() 함수에 의해 처리되기 전에 .pre('save', function(){}) 미들웨어 코드로 비밀번호 hash 상태로 변환시킴
// [ Mongoose 문법 ] 주의: 미들웨어(Middleware) 코드는 model 코드 이전에 작성되어야 함
// [ Mongoose 문법 ] 미들웨어(Middleware) / pre, post, hook 기능을 통해 object가 db에 저장 및 업데이트 하기 전 또는 후 시점에 사용자의 입력값에 대한 사전처리를 하거나 체크를 해야하는 경우가 있음
// [ Mongoose 문법 ] 미들웨어(Middleware) / pre, post, hook 코드 내에서 this는 저장하려는 문서를 가리킴
// 저장(save) 되기 전에(pre) Middleware(userSchema)로 호출될 async function

// [ Bcrypt 라이브러리 문법 ] 설치 명령어는 npm i bcrypt 이며 hacker가 rainbow table 공격을 bcrypt 라이브러리 적용을 통해 막을 수 있음 (secure code 보안 코드 확인요)
// [ Bcrypt 라이브러리 문법 ] bcrypt.hash(사용자 비밀번호, 해싱 횟수, 콜백함수(async, await 사용시 콜백함수는 불필요))
userSchema.pre('save', async function(){
  // [ Javascript 문법 ] this는 userController.js의 postJoin async 함수 내부에 있는 await User.create()를 가리킴 (즉, 사용자가 입력하여 submit한 값)
  console.log('user.js bcrypt 해싱전',this.passowrd);
  this.password = await bcrypt.hash(this.password, 5);
  console.log('user.js bcrypt 해싱후',this.passowrd);
})

// [ Bcrypt 라이브러리 문법 ] Hash 원리상 입력값이 동일하면 출력값이 항상 동일하므로 bcrypt.compare(사용자 입력값, DB Hash 처리된 값) 형태로 두 값을 비교하여 결과값으로 True/False 리턴함

const User = mongoose.model('User', userSchema);
export default User;