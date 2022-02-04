// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴
// express 엔진은 NodeJS를 실행시켜주는 package.json 파일 위치(cwd) 기준으로 views 폴더(src/views)를 바라보기 때문에 별도의 import, export 불필요

// User.js에서 export default User; 한 것을 import 함
import User from '../models/User';

// [ node-fetch 라이브러리 문법]
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

export const postLogin = async (req, res) => {
  console.log('postLogin-------------',req.body);
  
  const { username, password } = req.body;

  // [ Mongoose 문법 ] 2가지 작업(로그인을 위해 사용자가 입력한 username의 존재여부, 존재한다면 DB password와 입력한 password의 일치여부)을 위해 DB 정보를 여러 번 개별 검색(즉, User.exists(), User.findOne() )하기보다 단 한 번의 User.findOne() 검색 후 그 결과를 2가지 작업에서 재사용하는 형태로 코드 구성 간략화
                      // const userDbResult = await User.exists( { username } );
  const userDbResult = await User.findOne( { username } );

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
    // [ Github OAuth API 문법 ] Github 에서 지정한 파라미터 표기법에 따라 clientId 가 아닌 client_id 로 표기해야 값 인식 가능함
    // [ Github OAuth API 문법 & Javascript] client_id 값이 URL 쿼리문으로도 노출되기에 대외비는 아니지만 다회 사용되는 값이므로 .env 에 환경변수 넣어두고 필요시마다 사용함
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: 'read:user user:email',
  };
  
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

// [ Javascript 문법 ] await 코드 상위 코드에서 async 명사하지 않으면 SyntaxError: Unexpected reserved word 'await' 오류 발생함
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
      const apiUrl = 'https://api.github.com';
      const userData = await (
          await fetch(`${apiUrl}/user`, {
              headers: {
                Authorization: `token ${access_token}`
              }
           })
      ).json();

      console.log('userController.js --- finishGithubLogin --- userData', userData);
/*
      const emailData = await (
        await fetch(`${apiUrl}/user/emails`, {
          headers: {
            Authorization: `token ${access_token}`
          }
        })
      ).json();

      console.log('userController.js --- finishGithubLogin --- emailData', emailData);

      const emailObj = emailData.find(
        (email) => email.primary === true && email.verified === true
      );

      if (!emailObj){
        return res.redirect('/login');
      }

      const existingUser = await User.findOne({ email: emailObj.email });

      if(existingUser){
        // [ Express-session 라이브러리 연계 문법 ] 사용자가 로그인하면 그 사용자에 대한 로그인 정보를 session에 담기 (각 사용자(브라우저)마다 서로 다른 req.session 오브젝트(즉, 서로 다른 세션ID)를 갖고 있음)
        req.session.loggedIn = true;

        // [ Express-session 라이브러리 연계 문법 ] session 이 담긴 정보의 명칭을 userDbResult 로 지정했고, userDbResult는 middleware.js 의 localsMiddleware 함수 내의 res.locals.loggedInUserDb 가 이 값을 받아 login.pug 로 사용자 정보 값을 전달함
        req.session.userDbResult = existingUser;

        return res.redirect('/');
      }else {
        const user = await User.create({
          // [ Github OAuth API 문법 ] Github 를 이용해 계정 생성한 경우, password 값은 다뤄지지 않아 없으므로 username 와 password 키를 활용한 form 을 이용할 수 없음
          // [ Github OAuth API 문법 ] User.js 의 userSchema 모델에 socialOnly: {type: Boolean, default: false} 적용하여 사용자가 Github로 로그인했는지 여부를 확인하기 위함 / 로그인 페이지에서 사용자가 email로 로그인하려는데 password 없을 때 이를 대신해 github 로그인 상태를 확인해 볼 수 있음
          socialOnly: true,

          name: userData.name,
          email: userData.login,
          username: emailObj.email,
          password: '',
          location: userData.location    
        });

        req.session.loggedIn = true;
        
        // [ Express-session 라이브러리 연계 문법 ] session 이 담긴 정보의 명칭을 userDbResult 로 지정했고, userDbResult는 middleware.js 의 localsMiddleware 함수 내의 res.locals.loggedInUserDb 가 이 값을 받아 login.pug 로 사용자 정보 값을 전달함
        req.session.userDbResult = user;

        return res.redirect('/');
    }
*/
  }else {
    return res.redirect('/login');
  }
};

// videoRouter.js 파일에서 import하여 사용함
export const edit = (req, res) => res.send("Edit User ctrl");

// delete는 JS 예약어라서 변수명으로 선언 불가, 변수명을 remove로 대체 선언
export const remove = (req, res) => res.send("Remove User ctrl");
export const logout = (req, res) => res.send("logout User ctrl");

// README.md 내용 /users/:id -> See User
export const see = (req, res) => res.send("see user ctrl");

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가
//export default join;