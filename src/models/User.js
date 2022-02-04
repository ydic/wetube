import mongoose from 'mongoose';

// [ Bcrypt 라이브러리 문법 ] 설치 명령어는 npm i bcrypt 이며 hacker가 rainbow table 공격을 bcrypt 라이브러리 적용을 통해 막을 수 있음 (secure code 보안 코드 확인요)
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({

  // [ Github OAuth API 문법 ] 사용자가 Github로 로그인했는지 여부를 확인하기 위함 / 로그인 페이지에서 사용자가 email로 로그인하려는데 password 없을 때 이를 대신해 github 로그인 상태를 확인해 볼 수 있음
  socialOnly: {type: Boolean},

  name: { type: String, required: true },
  // [ Mongoose 문법 ] Schema 지정시 unique 속성 지정하여 고유 인덱스로 만듦
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  
  // [ Github OAuth API 문법 ] Github 를 이용해 계정 생성한 경우, password 값은 다뤄지지 않아 없으므로 username 와 password 키를 활용한 form 을 이용할 수 없음
  // [ Github OAuth API 문법 ] password 항목의 required: 속성을 해제해야 정상 동작함 (일부 사용자들에게는 password 가 없을 수도 있기 때문)
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