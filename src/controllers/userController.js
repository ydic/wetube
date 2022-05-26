// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴
// express 엔진은 NodeJS를 실행시켜주는 package.json 파일 위치(cwd) 기준으로 views 폴더(src/views)를 바라보기 때문에 별도의 import, export 불필요

// User.js에서 export default User; 한 것을 import 함
import User from '../models/User';

// [ node-fetch 라이브러리 문법] 브라우저의 JS에서는 fetch 함수 있지만 서버의 nodejs는 없다는 점(에러 문구: fetch is not defined)에서 다른 플랫폼임을 확인할 수 있음. 
// [ node-fetch 라이브러리 문법] node-fetch 라이브러리 설치를 통해 서버의 nodejs 에서도 관련 기능 사용 가능해짐
import fetch from 'node-fetch';

// [ bcrypt 라이브러리 문법 ] postLogin 컨트롤러에서 로그인 처리를 위해 bcrypt.compare() 내장함수로 사용자 입력 비밀번호와 DB Hash 비밀번호 값이 동일한지 비교하기 위함
import bcrypt from 'bcrypt';

// pug 파일 가리킬 때 res.render('따옴표 포함한 pug파일명') 입력해야 TypeError: View is not a constructor 에러 안 생김

/*
export const join = (req, res) => res.send("Join");
export const edit = (req, res) => res.send("Edit User ctrl");
*/

// server.js 파일에서 import하여 사용함
export const getJoin = (req, res) => res.render('join', { pageTitle: 'Join'});

export const postJoin = async (req, res) => {
  console.log('postJoin 들어온 요청내용',req.body)
  
  // Pug 코드의 form 태그 내의 input 태그에 name 속성으로 명명해 주어야 POST submit한 값이 key: value 형태로 req.body에서 포착 가능함
  const { name, email, username, password, password2, location } = req.body;
  
  // 주의 (Validation 검사 코드 리팩토링요): username, email 항목 duplicate error 검사 코드와 password, password2 입력값 일치 여부 확인 검사 코드가 동시에 기능하지 않음 (즉, username과 email 둘 중 한 가지 항목이 db데이터와 중복되는데다 password, password2 입력값도 일치하지 않아 두 가지 검사에 모두 오류 발생해도 한 가지 항목에 대해서만 에러메시지 나오는 허점 있음) 
  if(password !== password2){
    // res.render() 코드 앞에 return 표기를 붙여야 그 이하의 코드가 계속 이어서 실행되지 않게 function을 종료할 수 있음
    return res.render('join', {pageTitle: 'Join', errorMessage: 'Password confirmation does not match.'})
  }

          /*
            // 코드 폐기 이유: 유사 코드 중복되고 usernmae과 email이 동시에 db데이터와 모두 중복된 경우라도 한 가지 항목에 대해서만 기능이 동작함
            const usernameExists = await User.exists({ username });
            if(usernameExists){
              return res.render('join', { pageTitle: 'Join', errorMessage: 'This username is already taken.'});
            }

              const emailExists = await User.exists({ email });
              if(emailExists){
                return res.render('join', { pageTitle: 'Join', errorMessage: 'This email is already taken.'});
              }
          */

  // 주의 (Validation 검사 코드 리팩토링요): username, email 항목 duplicate error 검사 코드와 password, password2 입력값 일치 여부 확인 검사 코드가 동시에 기능하지 않음 (즉, username과 email 둘 중 한 가지 항목이 db데이터와 중복되는데다 password, password2 입력값도 일치하지 않아 두 가지 검사에 모두 오류 발생해도 한 가지 항목에 대해서만 에러메시지 나오는 허점 있음) 
  // [ MongoDB 문법 & Mongoose 문법 ] MongoError: duplicate key error 에러가 발생하면 DB에 저장하기 전에 에러를 앞서서 포착하여 사용자에게 에러 메시지를 보여주기
  // [ Mongoose 문법 ] <db model>.exists( { key : value } ) 내장함수로 사용자가 submit한 입력값이 이미 db에 존재하는지 확인한 후 True/False (즉, boolean) 형태로 결과를 return 해줌 (if문 판정기준으로 활용)
  // [ MongoDB 문법 ] $or 라는 operator를 통해 각 조건이 true일 때(즉, 여러 조건 중에 하나만 해당되더라도) 실행되도록 만들 수 있음 (예- await User.exists({ $or : [ {username}, {email}] }); )
  // [ Mongoose 문법 ] 주의: await User.exists({ username, email });로 지정할 경우 username과 email 둘 다 DB데이터와 중복될 경우에만 사용자에게 에러 메시지 보여주는 논리적 오류 발생하게 됨
  const existsResult = await User.exists({ $or : [ {username}, {email}] });
  if(existsResult){
    // [ Mongoose 문법 ] 주의: 한 collection 내의 db Schema에서 unique 속성을 지정한 항목이 2개 이상일 경우, $or 라는 operator를 사용한 await User.exists({ $or : [ {username}, {email}] }); 코드로 모든 db데이터 중복 에러를 포착할 수 있으나 사용자에게 에러 메시지 보여줄 때 어느 항목에서 기인한 중복 db데이터 오류인지 특정하여 알려주기 어려운 단점이 있음
    // 400 Bad Request 클라이언트 오류(예: 잘못된 요청 구문, 유효하지 않은 요청 메시지 프레이밍, 또는 변조된 요청 라우팅)
    // [ Express 문법 ] User.exists() 결과가 True(X: False)이면 User.create() 진입 못하고 return res.render() 라고만 처리하면 사용자에게는 오류 맥락을 이해시켰지만 브라우저는 상태 응답 코드 200을 받은 상태라서 로그인 입력값 저장여부 묻는 팝업이 나타남. 브라우저도 오류 상황으로 처리할 수 있도록 .status() 문법으로 상태 코드를 명시해야 함. 그러면 morgan 미들웨어(즉, app.use(logger);) 통해 서버 로그 상에 POST /join 400 라고 표시됨
    
    return res.status(400).render('join', { pageTitle: 'Join', errorMessage: 'This username/email is already taken.'});
  }

  // document (즉, javascript object)는 데이터를 가진 사용자 프로필이며 documnet를 db에 저장해야 함
  // [ Mongoose 문법 ] models/User.js 코드에 있는 mongoose.Schema() 기반으로 User.create() 함
  // [ Mongoose 문법 ] .create() 내장함수 사용하면 document(즉, javascript object)를 만들어주는 과정을 우리가 직접 하지 않아도 됨
  // [ Mongoose 문법 ] models/User.js 코드에서 데이터 형태를 미리 정해둔 덕분에 mongoose가 데이터 타입의 유효성 검사(validation)를 도와주고 있어서 한결 수월한 코딩 환경 상태
  
  try {
    await User.create({
      // [ MongoDB 문법 ] Mongo Shell에서 .create() 결과물 확인하기 (명령어 순서: mongo / show dbs / use wetube / show collections / db.users.find() 명령어로 데이터 조회하면 사용자 비밀번호가 실제 입력값 그대로 노출되는 문제를 확인할 수 있음. 따라서 bctypt 라이브러리에 기반한 hash 함수(일방향 함수이므로 출력값으로 입력값 알 수 없음. 같은 입력값으로는 항상 같은 출력값 나옴)를 비밀번호에 적용하여 db에 비밀번호가 hash 상태로 저장되도록 보안성 강화요
      // [ MongoDB 문법 ] Mongo Shell에서 데이터 지우는 명령어는 db.콜렉션명.remove({}) (질문: 리눅스의 rm -f 같이 실행권한 강력한 명령어인 것인가?)
      name, email, username, password, location
    })
    
    return res.redirect('/login');
  } catch(error) {
    // User.create() 함수 동작 관련해 처리하지 못한 에러가 있을 수도 있으니 try {} catch(error) {} 구문으로 에러를 처리함
    return res.status(400).render('upload', { pageTitle: "Join Error", errorMessage: error._message},)
  }
};

export const getLogin = (req, res) => {
  return res.render('login', { pageTitle: "Login" });
}

// [ Github OAuth API 문법 ] 강의클립 #7.21 사이트ID(본 프로젝트에서는 email)/PW 방식 가입자가 아닌 github OAuth 방식 가입자는 본 DB 서버 내에 email 값은 있어도 password 없기에, Password 미보유 상태이니 github 통해 로그인하라고 알려주거나 password를 새로 생성하는 페이지를 만들어 주어야 함.
export const postLogin = async (req, res) => {
  console.log('postLogin-------------',req.body);
  
  const { username, password } = req.body;
    
  // [ Github OAuth API 문법 ] Github 계정(socialOnly: true)으로 로그인하는 것이 아닌 사용자들(username password 방식 사용자들인 socialOnly: false)만 DB에서 검색
  const userDbResult = await User.findOne( { username, socialOnly: false } );

  // [ Mongoose 문법 ] 2가지 작업(로그인을 위해 사용자가 입력한 username의 존재여부, 존재한다면 DB password와 입력한 password의 일치여부)을 위해 DB 정보를 여러 번 개별 검색(즉, User.exists(), User.findOne() )하기보다 단 한 번의 User.findOne() 검색 후 그 결과를 2가지 작업에서 재사용하는 형태로 코드 구성 간략화
            // const userDbResult = await User.findOne( { username } );
                        // const userDbResult = await User.exists( { username } );

  if (!userDbResult) {
    return res.status(400).render('login', { pageTitle: 'Login', errorMessage: 'An account with this username does not exist.'})
  }

  // [ Bcrypt 라이브러리 문법 ] postLogin 컨트롤러에서 로그인 처리를 위해 bcrypt.compare() 내장함수로 사용자 입력 비밀번호와 DB Hash 비밀번호 값이 동일한지 비교하기 위함
  // [ Bcrypt 라이브러리 문법 ] Hash 원리상 입력값이 동일하면 출력값이 항상 동일하므로 bcrypt.compare(사용자 입력값, DB Hash 처리된 값) 형태로 두 값을 비교하여 결과값으로 True/False 리턴함
  
  const matchedPassword = await bcrypt.compare(password, userDbResult.password)

  if(!matchedPassword){
    return res.status(400).render('login', { pageTitle: 'Login', errorMessage: 'Wrong Password'})
  }
  
  // [ Express-session 라이브러리 연계 문법 ] 사용자가 로그인하면 그 사용자에 대한 로그인 정보를 session에 담기 (각 사용자(브라우저)마다 서로 다른 req.session 오브젝트(즉, 서로 다른 세션ID)를 갖고 있음)
  // [ Express-session 라이브러리 연계 문법 ] session 이 담긴 정보의 명칭을 userDbResult 로 지정했고, userDbResult는 middleware.js 의 localsMiddleware 함수 내의 res.locals.loggedInUserDb 가 이 값을 받아 login.pug 로 사용자 정보 값을 전달함
  req.session.loggedIn = true;
  req.session.userDbResult = userDbResult;

  console.log('userController.js ---- postLogin 함수',req.session.userDbResult);
  return res.redirect('/');
}

// userRouter.js 파일에서 import하여 사용함
export const startGithubLogin = (req, res) => {
  // [ Github OAuth API 문법 ] 권한 부여 가이드 페이지(1. Request a user's GitHub identity)에서 지정한 url 값임(https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps) 
  const baseUrl = 'http://github.com/login/oauth/authorize';

  const config = {
    // [ Github OAuth API 문법 ] (카톡, 인스타그램 등은 명칭이 다를 수 있음) Github 에서 지정한 파라미터 표기법에 따라 clientId 가 아닌 client_id 로 표기해야 값 인식 가능함
    // [ Github OAuth API 문법 & Javascript] client_id 값이 URL 쿼리문으로도 노출되기에 대외비는 아니지만 다회 사용되는 값이므로 .env 에 환경변수 넣어두고 필요시마다 사용함
    client_id: process.env.GH_CLIENT,
    allow_signup: true,

    // [ Github OAuth API 문법 ] access_token 은 모든 걸 할 수 있도록 허용하는 만능이 아니라 scope 에 적은 내용에 대해서만 허용해 줌
    // [ Github OAuth API 문법 ] 코드 해석 - user 정보 읽어들이기, user의 email 정보 읽어들이기 (니코가 학습 차원에서 추가한 코드)
    scope: 'read:user user:email',
  };
  
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

/*
wetube 코스에서 코드로 다룬 상황 첫 번째:
깃허브로 로그인 할때 왜 안되나 계속 찾아보고있었는데 깃헙에 있는 조건에 맞는 이메일이 이전 수업에 Join 에서 만든 아이디 속 이메일과 같아야 하는군여 ㅋㅋㅋ
깃헙로그인이 왜 안되나 오래오래 고민하다가 김치(포기)를 셀뻔했읍니다...
DB에 [wetube 사이트ID/PW 형태로 가입하면서 입력한 email값(일명, A)]이 존재하는 경우,
그 email값이 [Github 계정 로그인용 email값(일명, B)]과 동일하다면,
Github OAuth API를 통해 B값이 처리되어 access_token을 보내주게 되고,
access_token 내의 email 항목에 들어있는 값과 A값이 동일하다면,
session을 생성하고 Github OAuth 방식의 사용자를 로그인 시킴

2022-04-21 #7.21 강좌 클립 인사이트: 
wetube 코스에서 코드로 다루지 못한 줄 알았으나 다룬 상황 두 번째:
[Github 계정 로그인용 email값(일명, B)] 과 동일한 값이
wetube DB에는 없다면 (즉, [wetube 사이트ID/PW 형태로 가입하면서 입력한 email값(일명, A)] 중에 B값이 없는 경우라면)
wetube db 내에 email 값(즉, B값)에 해당하는 user(즉, A값)가 존재하지 않는 상태이므로 
access_token 에 대한 fetch 작업을 통해 github OAuth 로그인 성공한 사용자에 대한 정보값(즉, userData 와 emailObj 에 들어있는 사용자에 대한 정보)을 기반으로 wetube db 에 계정을 생성해야 함

*** 상황 두 번째에 대한 개인적인 오해: DB에 [wetube 사이트ID/PW 형태로 가입한 적이 없어서 email값(일명, C)]이 존재하지 않는 경우, Github OAuth API를 통해 access_token 받아와도, access_token 내의 email 항목에 들어있는 값과 C값이 동일한지 비교해야 하는데 C값이 입력된 적이 없어 존재하지 않으므로, Github 자체 로그인 성공했어도 wetube에는 로그인 처리 되지 않음. redirect도 되지 않음. Github OAuth API 방식으로 로그인 성공해서 access_token 받아오거나 Github에서 발행한 유일키값(뭐가 됐든)을 wetube DB에 저장해 두었다가 비교대조하여 로그인 되도록 하는 상황은 wetube 코스에서 다루지 못한 것으로 보임. (즉, wetube 사이트ID/PW 형태로 가입했어야 하고 github 로그인용 email값을 wetube 사이트 가입시 email란에 기재했어야만 향후에 wetube ID/PW 형태 아니더라도 Github 계정으로 wetube 로그인 할 수 있는 반쪽짜리 로그인 기능임. 즉, 일명 OAuth 기능 생색내기)
*/

// [ Javascript 문법 ] await 코드 상위 코드에서 async 명시하지 않으면 SyntaxError: Unexpected reserved word 'await' 오류 발생함
export const finishGithubLogin = async (req, res) => {
  // [ Github OAuth API 문법 ] 권한 부여 가이드 페이지(2. Users are redirected back to your site by GitHub)에서 지정한 POST 요청할 주소임(https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps) 
  const baseUrl = 'https://github.com/login/oauth/access_token';

  const config = {
    client_id: process.env.GH_CLIENT,
    // [ Github OAuth API 문법 ] client_secret 은 대외비이므로 .env 에 환경변수로 별도 분리 저장 관리함
    client_secret: process.env.GH_SECRET,
    code: req.query.code
  };

  // console.log('userController.js --- finishGithubLogin --- config',config);

  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  // [ node-fetch 라이브러리 문법] 브라우저의 JS에서는 fetch 함수 있지만 서버의 nodejs는 없다는 점(에러 문구: fetch is not defined)에서 다른 플랫폼임을 확인할 수 있음. 
  // [ node-fetch 라이브러리 문법] node-fetch 라이브러리 설치를 통해 서버의 nodejs 에서도 관련 기능 사용 가능해짐
  // [ Javascript 문법 ] async 이하 await fetch 이후에 json 가져오는 것이 코드 간결성 높음 (코드 간결성 낮은 형태는 async 이하 await fetch 와 .then() 조합)
  // [ Github OAuth API 문법 ] async 이하 이중으로 await 코딩한 이유: finalUrl 주소로 POST 하여 fetch 작업을 통해 받아온 access_token 값을 다시 한 번 json() 함수 처리하여 API 접근에 사용함(즉, https://api.github.com/user)
  const tokenRequest = await (
      await fetch(finalUrl, {
          method: 'POST',
          // [ Github OAuth API 문법 ] 권한 부여 가이드 페이지(2. Users are redirected back to your site by GitHub)에서 지정한 accept 파라미터 사용법임. You can also receive the response in different formats if you provide the format in the Accept header.
          headers: {
            Accept: 'application/json'
          }
      })
  ).json();
  
  if('access_token' in tokenRequest){
      const {access_token} = tokenRequest;
      
      // [ Github OAuth API 문법 ] 권한 부여 가이드 페이지(3. Use the access token to access the API)에서 지정한 GET 요청할 주소임 (https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps) 
      // [ Github OAuth API 문법 ] access_token 을 서버단의 nodejs (즉, node-fetch 라이브러리 기반) 에서 fetch 하여 Github 측으로부터 최종적으로 받아온 사용자 정보가 들어있는 userData 값의 email 키에 든 값이 null 일 때를 대비해서 (즉, 사용자의 메일 정보를 요청하려고 startGithubLogin 함수 내에서 scope: 'read:user user:email' 라고 명시했었기에 ) 별개의 request 를 추가로 만들어야 함
      const apiUrl = 'https://api.github.com';
      
      // 효율적인 코드 방법론 : fetch 를 하고나서 await 으로 감싼뒤에 json() 으로 처리함
      // 비효율적인 코드 방법론(.then 내부로 들어가야 하므로) : fetch(x).then(response => response.json()).then(json => qwerty)
      const userData = await (
          await fetch(`${apiUrl}/user`, {
              headers: {
                Authorization: `token ${access_token}`
              }
          })
      ).json();

      console.log('userController.js --- finishGithubLogin --- userData', userData);
      
      // [ Github OAuth API 문법 ] 본인게정 settings 메뉴 하위의 Emails 메뉴에서 Keep my email addresses private 항목을 비활성화 하면 visibility: 'public' 으로 설정됨 
      // [ Github OAuth API 문법 ] userData 내부의 email 값이 null 형태로 표시되며 나타나지 않는 경우의 사용자도 있으므로 email 관련해서만 별도로 github 에 fetch 시도하는 코드를 구성함
      // [ Github OAuth API 문법 ] https://docs.github.com/en/rest/reference/users#emails
      // 효율적인 코드 방법론 : fetch 를 하고나서 await 으로 감싼뒤에 json() 으로 처리함
      // 비효율적인 코드 방법론(.then 내부로 들어가야 하므로) : fetch(x).then(response => response.json()).then(json => qwerty)
      const emailData = await (
        await fetch(`${apiUrl}/user/emails`, {
          headers: {
            Authorization: `token ${access_token}`
          }
        })
      ).json();

      // emailData 에 읽어들인 값 중에서 확인하려는 값은 verified: true 이고 primary: true 인 이메일 값
                // console.log('userController.js --- finishGithubLogin --- emailData', emailData);

      const emailObj = emailData.find(
        (email) => email.primary === true && email.verified === true
      );

      console.log('userController.js --- finishGithubLogin --- emailObj', emailObj)
      
      if (!emailObj){
        return res.redirect('/login');
      }
      // [ Github OAuth API 문법 ] github OAuth 방식으로 wetube 사이트 로그인하려는 사용자에 대해서는 이메일값 대조를 통한 wetube 로그인 승인 과정을 거쳐야 함
      // [ Github OAuth API 문법 ] github 로부터 fetch 해온 emailData 값 내의 primary 속성, verified 속성이 모두 true 인 emailObj 라는 변수에 든 이메일값을 wetube DB 에서 검색하여 일치하는 값이 있다면 github OAuth 로그인 방식의 사용자에게 session 부여하여 로그인시키도록 함
      // [ Javascript 문법 ] if(){ }else{ } 조건문에서 양단 코드문에서 모두 **user현 existingUser구**가 사용되므로 const **user현 existingUser구** 속성을 let **user현 existingUser구** 로 변경함
      let user = await User.findOne({ email: emailObj.email });

      // [ Github OAuth API 문법 ] #7.21 강의클립 - userController.js 의 finishGithubLogin 함수 내에서 Github 계정을 통한 사이트 가입자일 경우, 사이트 자체 DB에 password 정보가 null 상태일 것이므로 사용자의 password 입력갑을 bcrypt.compare() 수행할 수 없으니 if else 구문으로 본 경우의 수를 별도로 처리해야 함
      // [ Github OAuth API 문법 ] #7.21 강의클립 - 즉, 사용자가 Github 로 계정을 만들어서 (사실상 password 는 사용자가 DB 에 등록한 적이 없어 null 상태임에도) password 로 로그인을 시도한다면, 사용자에게 password 가 없으니 (즉, wrong 아니라 null) Github 로 로그인하라고 알려주거나 password 를 새로 생성하는 페이지를 만들어야 함
      // [ Github OAuth API 문법 ] Github 로 계정을 만든 사용자는 password 가 null 상태이므로 console.log 참고 - user.js bcrypt 해싱전 undefined / user.js 의 bcrypt.hash() 함수 / user.js bcrypt 해싱후 undefined
      if(!user){
              // [ Javacript 문법 ] if( ) 구성을 if(! ) 구성으로 변경함
              // if(**user현 existingUser구**){

        /*
        wetube 코스에서 코드로 다룬 상황 첫 번째:
        깃허브로 로그인 할때 왜 안되나 계속 찾아보고있었는데 깃헙에 있는 조건에 맞는 이메일이 이전 수업에 Join 에서 만든 아이디 속 이메일과 같아야 하는군여 ㅋㅋㅋ
        깃헙로그인이 왜 안되나 오래오래 고민하다가 김치(포기)를 셀뻔했읍니다...
        DB에 [wetube 사이트ID/PW 형태로 가입하면서 입력한 email값(일명, A)]이 존재하는 경우,
        그 email값이 [Github 계정 로그인용 email값(일명, B)]과 동일하다면,
        Github OAuth API를 통해 B값이 처리되어 access_token을 보내주게 되고,
        access_token 내의 email 항목에 들어있는 값과 A값이 동일하다면,
        session을 생성하고 Github OAuth 방식의 사용자를 로그인 시킴
        */

        // 강의 클립 #7.21 코드가 본 지점까지 실행되었다는 말은 wetube db 내에 email 값에 해당하는 user가 존재하지 않는 상태이므로 access_token 에 대한 fetch 작업을 통해 github OAuth 로그인 성공한 사용자에 대한 정보값(즉, userData 와 emailObj 에 들어있는 사용자에 대한 정보)을 기반으로 wetube db 에 계정을 생성해야 함
        
        /*
        2022-04-21 #7.21 강좌 클립 인사이트: 
        wetube 코스에서 코드로 다루지 못한 줄 알았으나 다룬 상황 두 번째:
        [Github 계정 로그인용 email값(일명, B)] 과 동일한 값이
        wetube DB에는 없다면 (즉, [wetube 사이트ID/PW 형태로 가입하면서 입력한 email값(일명, A)] 중에 B값이 없는 경우라면)
        wetube db 내에 email 값(즉, B값)에 해당하는 user(즉, A값)가 존재하지 않는 상태이므로 
        access_token 에 대한 fetch 작업을 통해 github OAuth 로그인 성공한 사용자에 대한 정보값(즉, userData 와 emailObj 에 들어있는 사용자에 대한 정보)을 기반으로 wetube db 에 계정을 생성해야 함

        *** 상황 두 번째에 대한 개인적인 오해: DB에 [wetube 사이트ID/PW 형태로 가입한 적이 없어서 email값(일명, C)]이 존재하지 않는 경우, Github OAuth API를 통해 access_token 받아와도, access_token 내의 email 항목에 들어있는 값과 C값이 동일한지 비교해야 하는데 C값이 입력된 적이 없어 존재하지 않으므로, Github 자체 로그인 성공했어도 wetube에는 로그인 처리 되지 않음. redirect도 되지 않음. Github OAuth API 방식으로 로그인 성공해서 access_token 받아오거나 Github에서 발행한 유일키값(뭐가 됐든)을 wetube DB에 저장해 두었다가 비교대조하여 로그인 되도록 하는 상황은 wetube 코스에서 다루지 못한 것으로 보임. (즉, wetube 사이트ID/PW 형태로 가입했어야 하고 github 로그인용 email값을 wetube 사이트 가입시 email란에 기재했어야만 향후에 wetube ID/PW 형태 아니더라도 Github 계정으로 wetube 로그인 할 수 있는 반쪽짜리 로그인 기능임. 즉, 일명 OAuth 기능 생색내기)
        */

                          // [ Javascript 문법 ] 현 코드 부분에 등장하는 await User.create({ }) 함수의 바로 위쪽 코드에서 이미 let user = await User.findOne({ }); 형태로 user 변수를 선언하고 wetube DB 검색값을 user 변수에  받아왔었음. 바르 그 아래단 코드에서는 const 형식자를 삭제한 user = await User.create({ }) 형태로 user 변수를 재활용해 github OAuth 로그인한 사용자를 wetube DB에 등록시키기 위한 내용을 담는 데 사용되고, 그 user 값은 req.session.userDbResult = user; 코드로 전달되어 세션 생성에 필요한 데이터로 사용된다
                          // const user = await User.create({
        user = await User.create({
          // [ Github OAuth API 문법 ] Github 를 이용해 계정 생성한 경우, password 값은 다뤄지지 않아 없으므로 username 와 password 키를 활용한 form 을 이용할 수 없음
          // [ Github OAuth API 문법 ] User.js 의 userSchema 모델에 socialOnly: {type: Boolean, default: false} 를 최초 기본값으로 적용하여 사용자가 Github로 로그인했는지 여부를 확인하기 위함(기본값이 false 이지만 로그인 페이지에서 사용자가 email로 로그인하려는데 password 없을 때 이를 대신해 github 로그인 상태를 확인해 볼 수 있으므로 socialOnly 값이 true로 처리된 사용자가 있다면 로그인 인증 처리 시키도록 코드 구성함)
          socialOnly: true,

          // [ Github OAuth API 문법 ] userController.js 의 finishGithubLogin 함수에서 access_token 을 서버단의 nodejs (즉, node-fetch 라이브러리 기반) 에서 fetch 하여 Github 측으로부터 최종적으로 받아온 사용자 정보가 들어있는 userData 값 내부에 들어있는 avatar_url 값을 읽어와 사용자가 등록한 사진(즉, 프로필 사진)을 보여주기 위함
          // [ Github OAuth API 문법 ] wetube 프로젝트 기준으로는 avatarUrl 값(즉, github 에서 받아온 avatar_url 값)이 없는 사용자는 wetube ID/PW 로만 계정을 만든 경우에 해당함
          avatarUrl: userData.avatar_url,

          // [ 코드 연계성 ] User.js 내의 new mongoose.Schema({}) 함수 내에서 username(즉, wetube 사이트 ID)과 email은 unique 속성임
          name: userData.name? userData.name: userData.login,
                  // [ Github OAuth API 문법 ] User.js 내의 new mongoose.Schema({}) 함수 내에서 name 값은 필수 입력되도록 name: { type: String, required: true } 처리되어 있음
                  // [ Github OAuth API 문법 ] 오류메시지 Error: User validation failed 발생원인은 github 프로필 설정(명령어 방식 예: git name )을 안하면 name 이 없어서 에러가 나므로 삼항 조건 연산자 ? : 활용해 null 값이어도 무언가로 그 값을 대체시켜 코드 진행되도록 처리함
                  // [ Github OAuth API 문법 ] 오류메시지 Error: User validation failed (친철하게 name path를 찾을 수 없다는 식의 문구가 아니어서 한참 헤맸네요)
                  // name: userData.name,

          // [ 코드 연계성 ] User.js 내의 new mongoose.Schema({}) 함수 내에서 username(즉, wetube 사이트 ID)과 email은 unique 속성임
          // [ 코드 연계성 ] ★ ★ ★ wetube 사이트 db 내에 username (즉, wetube 사이트 ID)값에 대한 unique 속성을 없앤다면, 유일키(Primary Key) 식별 불가되고, unique 속성을 유지한다면 wetube 사이트 가입이력 없으나 github OAuth 로 로그인 하려는 사용자의 userData.login 에 들어있는 github 사이트용 사용자 명칭의 일종 값을 읽어와서 wetube db 내에 await User.creat({}) 시도할 때 wetube 사이트 기가입자의 username (즉, wetube 사이트 ID)값과 중복될 경우 github OAuth 로그인 성공한 사용자가 wetube 기존 db내의 username 값의 unique 정책에 위배되어duplicate error  중복값 에러 발생하며 가입 처리 실패하는 경우도 일어남
          // [ 코드 연계성 ] ★ ★ ★ Error: E11000 duplicate key error collection: wetube.users index: email_1 dup key: { email: "ydic" }
          // [ 코드 연계성 ] ★ ★ ★ 그래서 강의 클립 #7.21 코드에서는 username: userData.login (내 경우 해당 실제값은 ydic) 라고 지정했으나, unique 속성으로 지정한 username (즉, wetube 사이트 ID) 값에 대한 duplicate error 를 피하기 위해 username: userData.node_id 형태로 node js 라이브러리의 도움을 받아 나름 유일키 형태로 대체함(값은 유일한 값이지만 값의 생김새는 사이트ID 같지는 않지만)
          username: userData.node_id,
          // username: userData.login,

          // [ Github OAuth API 문법 ] User.js 내의 new mongoose.Schema({}) 함수 내에서 location 값은 필수 입력 사항이 아니므로 github OAuth 에서 access_token 인증을 거쳐 받아온 userData 내에 location 값이 null 이어도 User.js 에 구성한 userSchema 코드 내용상으로 볼 때 validation error 오류 메시지 야기하지 않음
          location: userData.location,
          
          email: emailObj.email,
          
          // [ Github OAuth API 문법 ] 오류메시지 Path 'password' is required 발생.
          // [ Github OAuth API 문법 ] User.js 의 new mongoose.Schema({}) 함수 내의 password: { type: String, required: true } 코드 내에서 required: true 속성을 해제(삭제, 즉 false 로 만듦)하여, wetube 로그인용 password 는 없지만(본 코드 부문은 정확하게는 wetube 가입이력 자체가 없는데 github OAuth 게정 정보로 wetube를 가입 및 로그인 처리시키는 용도) github OAuth 방식 로그인 성공한 사용자에 대해 useController.js의 startGithubLogin 함수 내의 scope: 'read:user user:email' 부문에 대한 사용자 정보를 받아와서 github 사이트 로그인용 password를 제외한 wetube 사이트의 회원가입에 필요한 사용자 정보를 방아오도록 만듦 
          password: '',
        });
      }

        // [ Javascript 문법 ] if else 조건문에서 양단 간에 코드가 중복되어 if else 조건문은 if(! ) 문으로 간소화하고 중복코드는 if 문 밖으로 리팩토링함
                /* else */
        req.session.loggedIn = true;
        
        // [ Express-session 라이브러리 연계 문법 ] session 이 담긴 정보의 명칭을 userDbResult 로 지정했고, userDbResult는 middleware.js 의 localsMiddleware 함수 내의 res.locals.loggedInUserDb 가 이 값을 받아 login.pug 로 사용자 정보 값을 전달함
        req.session.userDbResult = user;
        return res.redirect('/');
                /* } */
  }else {
    // [ Github OAuth API 문법 ] access_token 은 일회성이므로 동일한 값의 access_token 을 Github 쪽에 fetch 하면 (즉, 브라우저단 JS fetch 역할을 서버단 nodejs 에서 사용하기 위해 설치한 node-fetch 라이브러리를 통한 fetch를 하면) Github 측에서 일회성 사용 만료에 대한 오류 설명 문구 띄어줌.
    return res.redirect('/login');
  }
};

export const getEdit = (req, res) => {
  res.render('edit-profile', { pageTitle: 'Edit Profile'});
}

export const postEdit = async (req, res) => {
  //- [ 코드 연계성 ] edit-profile.pug 에서 user가 POST 요청을 보내면 userController.js 의 postEdit 함수에서 body 값(pug 파일의 input(name='명칭') 에 대한 값이 object 형식으로 들어있음)을 받아서 읽어들일 수 있게 됨
  //- [ 코드 연계성 & Javascript 문법 ] pug 파일의 input(name='명칭') 에 대한 값이 object 형식으로 들어있으므로 Javscript ES6 문법을 활용해 body 값 내에서 가져다 사용할 key (즉, input(name='명칭'))를 명시해야 함
  //  [ 코드 연계성 ] user 로부터 수정하려는 내용에 대한 입력을 받아온 상태이므로, user 를 찾아서 update 해야 함
  
  // 혼합해서 데이터를 가져오기에 더 좋은 코딩 스타일이라서(즉, req 안에 있는 session 정보도 가져오고, req 안에 있는 body 정보도 가져오고)
  const {
          // middlewares.js 의 localsMiddleware 함수
          // [ Express-session 라이브러리 문법 ] 키값이 id 가 아니라 _id 임
          // [ Express-session 라이브러리 문법 ] middlewares.js 에서 로그인한 사용자 데이터가 담겨지는 부분의 코드인 console.log('로그인할 때 생성되는 res.session.userDbResult---------', req.session.userDbResult); 코드로 사용자 값에 대한 로그 결과물 속에서 키값이 id가 아닌 _id 임을 역추적으로 파악해낼 수 있어야 함
          session: { userDbResult: { _id }},
          
          // edit-profile.pug 의 from(method='POST') 이하 input 태그값에서 넘어온 값들
          body: { name:name, 
                  email, username, location }, 
        } = req;

  // [ Express-session 라이브러리 문법 ★★★ ] Wetube DB 에서는 userDbResult 오브젝트를 업데이트 했으나, session 은 wetube DB와 미연결 상태
  // [ Express-session 라이브러리 문법 ★★★ ] userController.js 의 postJoin 함수 내에서 req.session.userDbResult = userDbResult; 코드에서와 같이 session 에 userDbResult 를 넣도록 코딩한 상태이므로, wetube DB 에서 userDbResult 오브젝트를 업데이트 했으면 그 값이 그대로 반영되어 담겨지는 session 자체도 업데이트 해주어야 함
  await User.findByIdAndUpdate(_id, {
    name, email, username, location
  })

  return res.render('edit-profile');
}

// delete는 JS 예약어라서 변수명으로 선언 불가, 변수명을 remove로 대체 선언
export const remove = (req, res) => res.send("Remove User ctrl");

export const logout = (req, res) => {
  // [ Express-session 라이브러리 연계 문법 ] 실질적인 로그아웃을 위해서는 req.session.destroy() 함수를 통해 세션을 종료시켜야 함
  req.session.destroy();
  return res.redirect('/')
}

// README.md 내용 /users/:id -> See User
export const see = (req, res) => res.send("see user ctrl");

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가
//export default join;