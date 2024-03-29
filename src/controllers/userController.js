// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴
// express 엔진은 NodeJS를 실행시켜주는 package.json 파일 위치(cwd) 기준으로 views 폴더(src/views)를 바라보기 때문에 별도의 import, export 불필요

// User.js에서 export default User; 한 것을 import 함
// import User, { hashingPassword } from '../models/User';
import User from "../models/User";
// import Video from '../models/Video';

// [ node-fetch 라이브러리 문법] 브라우저의 JS에서는 fetch 함수 있지만 서버의 nodejs는 없다는 점(에러 문구: fetch is not defined)에서 다른 플랫폼임을 확인할 수 있음.
// [ node-fetch 라이브러리 문법] node-fetch 라이브러리 설치를 통해 서버의 nodejs 에서도 관련 기능 사용 가능해짐
import fetch from "node-fetch";

// [ bcrypt 라이브러리 문법 ] postLogin 컨트롤러에서 로그인 처리를 위해 bcrypt.compare() 내장함수로 사용자 입력 비밀번호와 DB Hash 비밀번호 값이 동일한지 비교하기 위함
import bcrypt from "bcrypt";

// pug 파일 가리킬 때 res.render('따옴표 포함한 pug파일명') 입력해야 TypeError: View is not a constructor 에러 안 생김

/*
export const join = (req, res) => res.send("Join");
export const edit = (req, res) => res.send("Edit User ctrl");
*/

// server.js 파일에서 import하여 사용함
export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  console.log("postJoin 들어온 요청내용", req.body);

  // Pug 코드의 form 태그 내의 input 태그에 name 속성으로 명명해 주어야 POST submit한 값이 key: value 형태로 req.body에서 포착 가능함
  const { name, email, username, password, password2, location } = req.body;

  // 주의 (Validation 검사 코드 리팩토링요): username, email 항목 duplicate error 검사 코드와 password, password2 입력값 일치 여부 확인 검사 코드가 동시에 기능하지 않음 (즉, username과 email 둘 중 한 가지 항목이 db데이터와 중복되는데다 password, password2 입력값도 일치하지 않아 두 가지 검사에 모두 오류 발생해도 한 가지 항목에 대해서만 에러메시지 나오는 허점 있음)
  if (password !== password2) {
    // res.render() 코드 앞에 return 표기를 붙여야 그 이하의 코드가 계속 이어서 실행되지 않게 function을 종료할 수 있음
    return res.render("join", {
      pageTitle: "Join",
      errorMessage: "Password confirmation does not match.",
    });
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
  const existsResult = await User.exists({ $or: [{ username }, { email }] });
  if (existsResult) {
    // [ Mongoose 문법 ] 주의: 한 collection 내의 db Schema에서 unique 속성을 지정한 항목이 2개 이상일 경우, $or 라는 operator를 사용한 await User.exists({ $or : [ {username}, {email}] }); 코드로 모든 db데이터 중복 에러를 포착할 수 있으나 사용자에게 에러 메시지 보여줄 때 어느 항목에서 기인한 중복 db데이터 오류인지 특정하여 알려주기 어려운 단점이 있음
    // 400 Bad Request 클라이언트 오류(예: 잘못된 요청 구문, 유효하지 않은 요청 메시지 프레이밍, 또는 변조된 요청 라우팅)
    // [ Express 문법 ] User.exists() 결과가 True(X: False)이면 User.create() 진입 못하고 return res.render() 라고만 처리하면 사용자에게는 오류 맥락을 이해시켰지만 브라우저는 상태 응답 코드 200을 받은 상태라서 로그인 입력값 저장여부 묻는 팝업이 나타남. 브라우저도 오류 상황으로 처리할 수 있도록 .status() 문법으로 상태 코드를 명시해야 함. 그러면 morgan 미들웨어(즉, app.use(logger);) 통해 서버 로그 상에 POST /join 400 라고 표시됨

    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "This username/email is already taken.",
    });
  }

  // document (즉, javascript object)는 데이터를 가진 사용자 프로필이며 documnet를 db에 저장해야 함
  // [ Mongoose 문법 ] models/User.js 코드에 있는 mongoose.Schema() 기반으로 User.create() 함
  // [ Mongoose 문법 ] .create() 내장함수 사용하면 document(즉, javascript object)를 만들어주는 과정을 우리가 직접 하지 않아도 됨
  // [ Mongoose 문법 ] models/User.js 코드에서 데이터 형태를 미리 정해둔 덕분에 mongoose가 데이터 타입의 유효성 검사(validation)를 도와주고 있어서 한결 수월한 코딩 환경 상태

  try {
    await User.create({
      // [ MongoDB 문법 ] Mongo Shell에서 .create() 결과물 확인하기 (명령어 순서: mongo / show dbs / use wetube / show collections / db.users.find() 명령어로 데이터 조회하면 사용자 비밀번호가 실제 입력값 그대로 노출되는 문제를 확인할 수 있음. 따라서 bcrypt 라이브러리에 기반한 hash 함수(일방향 함수이므로 출력값으로 입력값 알 수 없음. 같은 입력값으로는 항상 같은 출력값 나옴)를 비밀번호에 적용하여 db에 비밀번호가 hash 상태로 저장되도록 보안성 강화요
      // [ MongoDB 문법 ] Mongo Shell에서 데이터 지우는 명령어는 db.콜렉션명.remove({}) (질문: 리눅스의 rm -f 같이 실행권한 강력한 명령어인 것인가?)
      name,
      email,
      username,
      password,
      // password: await User.hashingPassword(password), // 기반 코드 - User.js 의 userSchema.static('hashingPassword', ) 
      // password: hashingPassword(password),
      location,
    });

    return res.redirect("/login");
  } catch (error) {
    // User.create() 함수 동작 관련해 처리하지 못한 에러가 있을 수도 있으니 try {} catch(error) {} 구문으로 에러를 처리함
    return res.status(400).render("upload", {
      pageTitle: "Join Error",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};

// [ Github OAuth API 문법 ] 강의클립 #7.21 사이트ID(본 프로젝트에서는 email)/PW 방식 가입자가 아닌 github OAuth 방식 가입자는 본 DB 서버 내에 email 값은 있어도 password 없기에, Password 미보유 상태이니 github 통해 로그인하라고 알려주거나 password를 새로 생성하는 페이지를 만들어 주어야 함.
export const postLogin = async (req, res) => {
  console.log("postLogin-------------", req.body);

  const { username, password } = req.body;

  // [ Github OAuth API 문법 ] Github 계정(socialOnly: true)으로 로그인하는 것이 아닌 사용자들(username password 방식 사용자들인 socialOnly: false)만 DB에서 검색
  const userDbResult = await User.findOne({ username, socialOnly: false });

  // [ Mongoose 문법 ] 2가지 작업(로그인을 위해 사용자가 입력한 username의 존재여부, 존재한다면 DB password와 입력한 password의 일치여부)을 위해 DB 정보를 여러 번 개별 검색(즉, User.exists(), User.findOne() )하기보다 단 한 번의 User.findOne() 검색 후 그 결과를 2가지 작업에서 재사용하는 형태로 코드 구성 간략화
  // const userDbResult = await User.findOne( { username } );
  // const userDbResult = await User.exists( { username } );

  if (!userDbResult) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this username does not exist.",
    });
  }

  // [ Bcrypt 라이브러리 문법 ] postLogin 컨트롤러에서 로그인 처리를 위해 bcrypt.compare() 내장함수로 사용자 입력 비밀번호와 DB Hash 비밀번호 값이 동일한지 비교하기 위함
  // [ Bcrypt 라이브러리 문법 ] Hash 원리상 입력값이 동일하면 출력값이 항상 동일하므로 bcrypt.compare(사용자 입력값, DB Hash 처리된 값) 형태로 두 값을 비교하여 결과값으로 True/False 리턴함

  const matchedPassword = await bcrypt.compare(password, userDbResult.password);

  if (!matchedPassword) {
    return res
      .status(400)
      .render("login", { pageTitle: "Login", errorMessage: "Wrong Password" });
  }

  // [ Express-session 라이브러리 연계 문법 ] 사용자가 로그인하면 그 사용자에 대한 로그인 정보를 session에 담기 (각 사용자(브라우저)마다 서로 다른 req.session 오브젝트(즉, 서로 다른 세션ID)를 갖고 있음)
  // [ Express-session 라이브러리 연계 문법 ] session 이 담긴 정보의 명칭을 userDbResult 로 지정했고, userDbResult는 middleware.js 의 localsMiddleware 함수 내의 res.locals.loggedInUserDb 가 이 값을 받아 login.pug 로 사용자 정보 값을 전달함
  req.session.loggedIn = true;
  req.session.userDbResult = userDbResult;

  console.log(
    "userController.js ---- postLogin 함수",
    req.session.userDbResult
  );
  return res.redirect("/");
};

// userRouter.js 파일에서 import하여 사용함
export const startGithubLogin = (req, res) => {
  // [ Github OAuth API 문법 ] 권한 부여 가이드 페이지(1. Request a user's GitHub identity)에서 지정한 url 값임(https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
  const baseUrl = "http://github.com/login/oauth/authorize";

  const config = {
    // [ Github OAuth API 문법 ] (카톡, 인스타그램 등은 명칭이 다를 수 있음) Github 에서 지정한 파라미터 표기법에 따라 clientId 가 아닌 client_id 로 표기해야 값 인식 가능함
    // [ Github OAuth API 문법 & Javascript] client_id 값이 URL 쿼리문으로도 노출되기에 대외비는 아니지만 다회 사용되는 값이므로 .env 에 환경변수 넣어두고 필요시마다 사용함
    client_id: process.env.GH_CLIENT,
    allow_signup: true,

    // [ Github OAuth API 문법 ] access_token 은 모든 걸 할 수 있도록 허용하는 만능이 아니라 scope 에 적은 내용에 대해서만 허용해 줌
    // [ Github OAuth API 문법 ] 코드 해석 - user 정보 읽어들이기, user의 email 정보 읽어들이기 (니코가 학습 차원에서 추가한 코드)
    scope: "read:user user:email",
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
  const baseUrl = "https://github.com/login/oauth/access_token";

  const config = {
    client_id: process.env.GH_CLIENT,
    // [ Github OAuth API 문법 ] client_secret 은 대외비이므로 .env 에 환경변수로 별도 분리 저장 관리함
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
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
      method: "POST",
      // [ Github OAuth API 문법 ] 권한 부여 가이드 페이지(2. Users are redirected back to your site by GitHub)에서 지정한 accept 파라미터 사용법임. You can also receive the response in different formats if you provide the format in the Accept header.
      headers: {
        // Content-Type 헤더와 Accept 헤더 둘 다 데이터 타입(MIME)을 다루는 헤더이다. 
        // 하지만  Content-Type 헤더는 현재 전송하는 데이터가 어떤 타입인지에 대한 설명을 하는 개념이고 
        // Accept 헤더는 클라이언트가 서버에게 어떤 특정한 데이터 타입을 보낼때 클라이언트가 보낸 특정 데이터 타입으로만 응답을 해야한다. 
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;

    // [ Github OAuth API 문법 ] 권한 부여 가이드 페이지(3. Use the access token to access the API)에서 지정한 GET 요청할 주소임 (https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
    // [ Github OAuth API 문법 ] access_token 을 서버단의 nodejs (즉, node-fetch 라이브러리 기반) 에서 fetch 하여 Github 측으로부터 최종적으로 받아온 사용자 정보가 들어있는 userData 값의 email 키에 든 값이 null 일 때를 대비해서 (즉, 사용자의 메일 정보를 요청하려고 startGithubLogin 함수 내에서 scope: 'read:user user:email' 라고 명시했었기에 ) 별개의 request 를 추가로 만들어야 함
    const apiUrl = "https://api.github.com";

    // 효율적인 코드 방법론 : fetch 를 하고나서 await 으로 감싼뒤에 json() 으로 처리함
    // 비효율적인 코드 방법론(.then 내부로 들어가야 하므로) : fetch(x).then(response => response.json()).then(json => qwerty)
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    console.log(
      "userController.js --- finishGithubLogin --- userData",
      userData
    );

    // [ Github OAuth API 문법 ] 본인게정 settings 메뉴 하위의 Emails 메뉴에서 Keep my email addresses private 항목을 비활성화 하면 visibility: 'public' 으로 설정됨
    // [ Github OAuth API 문법 ] userData 내부의 email 값이 null 형태로 표시되며 나타나지 않는 경우의 사용자도 있으므로 email 관련해서만 별도로 github 에 fetch 시도하는 코드를 구성함
    // [ Github OAuth API 문법 ] https://docs.github.com/en/rest/reference/users#emails
    // 효율적인 코드 방법론 : fetch 를 하고나서 await 으로 감싼뒤에 json() 으로 처리함
    // 비효율적인 코드 방법론(.then 내부로 들어가야 하므로) : fetch(x).then(response => response.json()).then(json => qwerty)
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    // emailData 에 읽어들인 값 중에서 확인하려는 값은 verified: true 이고 primary: true 인 이메일 값
    // console.log('userController.js --- finishGithubLogin --- emailData', emailData);

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );

    console.log(
      "userController.js --- finishGithubLogin --- emailObj",
      emailObj
    );

    if (!emailObj) {
      return res.redirect("/login");
    }
    // [ Github OAuth API 문법 ] github OAuth 방식으로 wetube 사이트 로그인하려는 사용자에 대해서는 이메일값 대조를 통한 wetube 로그인 승인 과정을 거쳐야 함
    // [ Github OAuth API 문법 ] github 로부터 fetch 해온 emailData 값 내의 primary 속성, verified 속성이 모두 true 인 emailObj 라는 변수에 든 이메일값을 wetube DB 에서 검색하여 일치하는 값이 있다면 github OAuth 로그인 방식의 사용자에게 session 부여하여 로그인시키도록 함
    // [ Javascript 문법 ] if(){ }else{ } 조건문에서 양단 코드문에서 모두 **user현 existingUser구**가 사용되므로 const **user현 existingUser구** 속성을 let **user현 existingUser구** 로 변경함
    let user = await User.findOne({ email: emailObj.email });

    // [ Github OAuth API 문법 ] #7.21 강의클립 - userController.js 의 finishGithubLogin 함수 내에서 Github 계정을 통한 사이트 가입자일 경우, 사이트 자체 DB에 password 정보가 null 상태일 것이므로 사용자의 password 입력갑을 bcrypt.compare() 수행할 수 없으니 if else 구문으로 본 경우의 수를 별도로 처리해야 함
    // [ Github OAuth API 문법 ] #7.21 강의클립 - 즉, 사용자가 Github 로 계정을 만들어서 (사실상 password 는 사용자가 DB 에 등록한 적이 없어 null 상태임에도) password 로 로그인을 시도한다면, 사용자에게 password 가 없으니 (즉, wrong 아니라 null) Github 로 로그인하라고 알려주거나 password 를 새로 생성하는 페이지를 만들어야 함
    // [ Github OAuth API 문법 ] Github 로 계정을 만든 사용자는 password 가 null 상태이므로 console.log 참고 - user.js bcrypt 해싱전 undefined / user.js 의 bcrypt.hash() 함수 / user.js bcrypt 해싱후 undefined
    if (!user) {
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
        name: userData.name ? userData.name : userData.login,
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
        password: "",
      });
    }

    // [ Javascript 문법 ] if else 조건문에서 양단 간에 코드가 중복되어 if else 조건문은 if(! ) 문으로 간소화하고 중복코드는 if 문 밖으로 리팩토링함
    /* else */
    req.session.loggedIn = true;

    // [ Express-session 라이브러리 연계 문법 ] session 이 담긴 정보의 명칭을 userDbResult 로 지정했고, userDbResult는 middleware.js 의 localsMiddleware 함수 내의 res.locals.loggedInUserDb 가 이 값을 받아 login.pug 로 사용자 정보 값을 전달함
    req.session.userDbResult = user;
    return res.redirect("/");
    /* } */
  } else {
    // [ Github OAuth API 문법 ] access_token 은 일회성이므로 동일한 값의 access_token 을 Github 쪽에 fetch 하면 (즉, 브라우저단 JS fetch 역할을 서버단 nodejs 에서 사용하기 위해 설치한 node-fetch 라이브러리를 통한 fetch를 하면) Github 측에서 일회성 사용 만료에 대한 오류 설명 문구 띄어줌.
    return res.redirect("/login");
  }
};

export const getEdit = (req, res) => {
  res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  //- [ 코드 연계성 ] edit-profile.pug 에서 user가 POST 요청을 보내면 userController.js 의 postEdit 함수에서 body 값(pug 파일의 input(name='명칭') 에 대한 값이 object 형식으로 들어있음)을 받아서 읽어들일 수 있게 됨
  //- [ 코드 연계성 & Javascript 문법 ] pug 파일의 input(name='명칭') 에 대한 값이 object 형식으로 들어있으므로 Javscript ES6 문법을 활용해 body 값 내에서 가져다 사용할 key (즉, input(name='명칭'))를 명시해야 함
  //  [ 코드 연계성 ] user 로부터 수정하려는 내용에 대한 입력을 받아온 상태이므로, user 를 찾아서 update 해야 함

  // 혼합해서 데이터를 가져오기에는 복잡한 코딩 스타일이라서 코드 논리는 맞지만 사용하지 않음
  /*
                        await User.findByIdAndUpdate(_id, {
                          name, email, username, location
                        })

                        req.session.userDbResult = {
                          // [ Javascript ES6 문법 ] ...req.session.userDbResult 문법은 req.session.userDbResult 안에 든 내용을 밖으로 꺼내주는 기능을 함
                          ...req.session.userDbResult,
                          // [ Javascript ES6 문법 ] ...req.session.userDbResult 문법으로 꺼내 담은 값들 중에 name, email, username, location 키값들에 대해서는 값을 덮어쓰기함(즉, 업데이트)
                          name, email, username, location
                        };
                        */

  // 혼합해서 데이터를 가져오기에 더 좋은 코딩 스타일이라서(즉, req 안에 있는 session 정보도 가져오고, req 안에 있는 body 정보도 가져오고)
  const {
    // middlewares.js 의 localsMiddleware 함수
    // [ Express-session 라이브러리 문법 ] 키값이 id 가 아니라 _id 임
    // [ Express-session 라이브러리 문법 ] middlewares.js 에서 로그인한 사용자 데이터가 담겨지는 부분의 코드인 console.log('로그인할 때 생성되는 res.session.userDbResult---------', req.session.userDbResult); 코드로 사용자 값에 대한 로그 결과물 속에서 키값이 id가 아닌 _id 임을 역추적으로 파악해낼 수 있어야 함

    session: {
      userDbResult: {
        _id,
        // userDbResult 내에는 기존에 저장된 avatarUrl 항목이 있어서 기존 avatarUrl 값을 꺼내올 수 있음
        avatarUrl,
      },
    },

    // edit-profile.pug 의 from(method='POST') 이하 input 태그값에서 넘어온 값들
    body: { name: name, email, username, location },

    // edit-profile.pug 에서 avatar용 파일 업로드하지 않았더니 req.file 은 undefined 되므로 path 값을 얻을 수 없는 오류 발생 TypeError: Cannot read property 'path' of undefined
    // file : { path },

    // [ Multer 라이브러리 문법 ] userRouter.js 의 userRouter.route('/edit').all(protectorMiddleware).get(getEdit).post(uploadFiles.single('avatar'), postEdit); 코드 결과로 Multer 라이브러리는 req.file 키를 생성 및 사용하도록 해줌
    // [ Multer 라이브러리 연계 문법] edit-profile.pug 에서 avatar용 파일 업로드하지 않았더니 avatarUrl 값은 내용이 비어있는 상태이므로 avatarUrl: file.path 사용 불가 ReferenceError: path is not defined
    // [ Multer 라이브러리 연계 문법] req.file 값을 userController.js 의 postEdit 함수 내의 findByIdAndUpdate 쿼리 함수에서 받아와 삼항연산 코드로 사용자가 avatar 이미지 업로드 하는 여부에 따라 이미지 소스경로를 달리 처리함 avatarUrl: file ? file.path : avatarUrl
    file,
  } = req;

  // console.log(path);
  // console.log('multer ', file);
  // console.log('userController.js ---- edit-profile.pug 의 form에서 넘어온 상태의 req 값들 중 ----- ',req.session.userDbResult, req.body)

  // ********* 코드챌린지 받기 직전까지의 클론 코딩 #8.3 Edit Profile POST part Two *********
  /*
                        const updatedUser = await User.findByIdAndUpdate(_id, {
                          name, email, username, location
                        }, {
                          // [ Mongoose 라이브러리 문법 ] https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
                          // [ Mongoose 라이브러리 문법 ] new: true 옵션을 설정하면 findByIdAndUpdate 가 업데이트 된 데이터를 return 해 줌. (즉, new: true 옵션이 지정되어 있지 않은 경우, 기본적으로 findByIdAndUpdate 는 업데이트 되기 전의 데이터를 return 해 줌)
                          // [ Mongoose 라이브러리 문법 ] new: true 옵션을 사용한다는 것은 "가장 최근 업데이트 된 object 를 원한다. 그 이전 데이터는 필요하지 않다."
                          new: true
                        })

                        req.session.userDbResult = updatedUser;
                        return res.redirect('/users/edit');
                        */

  // ********* 코드챌린지 내용 #8.3 Edit Profile POST part Two *********
  /*
  username 바꾸려는데 이미 있거나 email 바꾸려는데 이미 있다면
  ---> 업데이트 차단해야함
  
  사용자가 username 이나 email 업데이트하려는걸 아는 방법?
  ---> postEdit 함수에서 body는 form으로부터 받아오고
  form은 현재 사용자의 정보이고
  form 정보가 session의 userDbResult 정보와 같은지 확인해야함
  
  주의: userController.js 의 postJoin 함수의 exists 방식을 사용하면 항상 true 처리됨
  postEdit 에서 사용한 username과 email 은 현재 session에 있는 사용자의 정보이므로
  
  즉, postEdit 함수의 body의 username과 email이
  session.userDbResult 에 있는 username과 email 과 다른지 확인해야함
  다르다면 사용자가 username이나 email을 변경하고 싶다는것
  */

  if (req.session.userDbResult.username !== req.body.username) {
    const existsResultUsername = await User.exists({
      username: req.body.username,
    });
    if (existsResultUsername) {
      // 400 Bad Request 클라이언트 오류(예: 잘못된 요청 구문, 유효하지 않은 요청 메시지 프레이밍, 또는 변조된 요청 라우팅)
      // [ Express 문법 ] User.exists() 결과가 True(X: False)이면 res.render() 라고만 처리하면 사용자에게는 오류 맥락을 이해시켰지만 브라우저는 상태 응답 코드 200을 받은 상태라서 로그인 입력값 저장여부 묻는 팝업이 나타남. 브라우저도 오류 상황으로 처리할 수 있도록 .status() 문법으로 상태 코드를 명시해야 함. 그러면 morgan 미들웨어(즉, app.use(logger);) 통해 서버 로그 상에 POST /users/edit 400 라고 표시됨

      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "Please choose another. This username is already taken. ",
      });
    }
  }

  if (req.session.userDbResult.email !== req.body.email) {
    const existsResultEmail = await User.exists({ email: req.body.email });
    if (existsResultEmail) {
      // 400 Bad Request 클라이언트 오류(예: 잘못된 요청 구문, 유효하지 않은 요청 메시지 프레이밍, 또는 변조된 요청 라우팅)
      // [ Express 문법 ] User.exists() 결과가 True(X: False)이면 res.render() 라고만 처리하면 사용자에게는 오류 맥락을 이해시켰지만 브라우저는 상태 응답 코드 200을 받은 상태라서 로그인 입력값 저장여부 묻는 팝업이 나타남. 브라우저도 오류 상황으로 처리할 수 있도록 .status() 문법으로 상태 코드를 명시해야 함. 그러면 morgan 미들웨어(즉, app.use(logger);) 통해 서버 로그 상에 POST /users/edit 400 라고 표시됨

      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "Please choose another.This email is already taken. ",
      });
    }
  }

  // [ Javascript 문법 ] (질문) userController.js 의 postJoin 함수 내의 try{} catch(error){} 코드 구조에다 세부내용만 바꾼건데 try catch 코드를 목적과 용도에 맞게 사용한 게 맞는건지?
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        // [ GitHub 문법 ] .gitignore 에 /uploads 추가함
        // [ Multer 라이브러리 연계 문법 ] req.file 값을 userController.js 의 postEdit 함수 내의 findByIdAndUpdate 쿼리 함수에서 받아와 삼항연산 코드로 사용자가 avatar 이미지 업로드 하는 여부에 따라 이미지 소스경로를 달리 처리함 avatarUrl: file ? file.path : avatarUrl
        // [ Multer 라이브러리 연계 문법 ] edit-profile.pug 에서 avatar용 파일 업로드하지 않았더니 avatarUrl 값은 내용이 비어있는 상태이므로 avatarUrl: file.path 사용 불가 ReferenceError: path is not defined
        // [ Multer 라이브러리 연계 문법 ] 사용자가 edit-profile.pug 에서 avatar 파일을 업로드한다면 file.path 를 사용하고, 업로드하지 않았다면 현재 로그인한 사용자의 session 의 userDbResult 에 내장된 기존 avatarUrl 에 들어있는 이미지 값으로 유지함
        // [ Mongo DB & Mongoose 라이브러리 문법 ] 코드 원칙: DB 에 파일 저장 금지 / 폴더(예- Amazon HDD)에만 파일 저장 / DB 에는 파일의 경로만 저장
        avatarUrl: file ? file.path : avatarUrl,

        // 사용자가 이미 avatar 있다면, undefined 상태인 avatar 를 보내면 안됨
        // avatarUrl: path,
        name,
        email,
        username,
        location,
      },
      {
        // [ Mongoose 라이브러리 문법 ] https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
        // [ Mongoose 라이브러리 문법 ] new: true 옵션을 설정하면 findByIdAndUpdate 가 업데이트 된 데이터를 return 해 줌. (즉, new: true 옵션이 지정되어 있지 않은 경우, 기본적으로 findByIdAndUpdate 는 업데이트 되기 전의 데이터를 return 해 줌)
        // [ Mongoose 라이브러리 문법 ] new: true 옵션을 사용한다는 것은 "가장 최근 업데이트 된 object 를 원한다. 그 이전 데이터는 필요하지 않다."
        new: true,
      }
    );
    // console.log('userController.js --- updatedUser-----------', updatedUser);

    // [ Express-session 라이브러리 문법 ★★★ ] Wetube DB 에서는 userDbResult 오브젝트를 업데이트 했으나, session 은 wetube DB와 미연결 상태라서 프론트엔드(브라우저 화면)에 반영되지 않는 문제 상황. 프론트엔드는 session 으로부터 정보를 얻도록 코딩했으므로.
    // [ Express-session 라이브러리 문법 ★★★ ] session 은 로그인 할 때 한 번만 작성되도록 코딩함. 로그인 이후에는 session 을 건드리지 않기 떄문에 로그인 했을 때 읽어들인 userDbResult 값의 모습으로 그대로 잔류하는 상태.
    // [ Express-session 라이브러리 문법 ★★★ ] userController.js 의 postJoin 함수 내에서 req.session.userDbResult = userDbResult; 코드에서와 같이 session 에 userDbResult 를 넣도록 코딩한 상태이므로, wetube DB 에서 userDbResult 오브젝트를 업데이트 했으면 그 값이 그대로 반영되어 담겨지는 session 자체도 업데이트 해주어야 함
    req.session.userDbResult = updatedUser;
    
    // [ epxress-flash 문법 ] req.flash() 통해 사용자에게 프로필 변경 POST 요청 처리 성공 알림 메시지 표시하여 상황 알림
    // [ express-flash 문법 ] 템플릿 (즉, Pug) 단에서 messages.직접작명한메시지유형명칭 으로 이 값을 받아서 표시해 주어야 브라우저 화면에 메시지 나타남
    req.flash('success', 'Changes saved.');

    return res.redirect("/users/edit");
  } catch (error) {
    return res.status(400).render("edit-profile", {
      pageTitle: "Edit profile Error",
      errorMessage: error._message,
    });
  }
};

export const getChangePassword = (req, res) => {
  // [ Pug 라이브러리 문법 ] Error: Failed to lookup view "ABC" in views directory
  // [ Pug 라이브러리 문법 ] 오류 해석: userController.js 의 getChangePassword 함수 내의 return res.render('ABC', { pageTitle: 'Change Password'}) 코드에서 시킨대로 views 폴더(즉, Pug 엔진 프론트엔드 상호작용 고유경로) 이하에서 ABC.pug 를 찾지못했다(아직 안 만들었으니까)
  // [ Pug 라이브러리 문법 ] views 폴더 이하에 pug 파일이 너무 많아져서 폴더로 카테고리화 하기 위해 views 폴더 이하에 users 폴더를 만들고 그 안에 change-password.pug 를 생성함

  //- [ Github OAuth API 연계 문법 ] Github OAuth 방식으로 wetube DB 에 계정 만든 사용자는 Wetube DB 내에 비밀번호 값이 없으므로 비밀번호 변경 페이지 자체를 보여주지 말아야 함
  if (req.session.userDbResult.socialOnly === true) {

    // [ epxress-flash 문법 ] req.flash() 통해 Github 계정을 통해 가입한 사용자에게 비밀번호 변경 요청 처리 불가 알림 메시지 표시하여 상황 알림
    // [ express-flash 문법 ] 템플릿 (즉, Pug) 단에서 messages.직접작명한메시지유형명칭 으로 이 값을 받아서 표시해 주어야 브라우저 화면에 메시지 나타남
    req.flash('error', 'Users logged in with Github can\'t change password.');

    return res.redirect("/");
  }
  // [ Pug 라이브러리 문법 ] views 폴더 이하에 pug 파일이 너무 많아져서 폴더로 카테고리화 하기 위해 views 폴더 이하에 users 폴더를 만들고 그 안에 change-password.pug 를 생성함
  // [ Pug 라이브러리 문법 ] return res.render('users/change-password', {생략}) 코드의 users/change-password 경로는 userRouter.js 내의 userRouter.route('/change-password').생략 코드와는 별개이며 pug 엔진이 참조하는 views 폴더 이하의 users 폴더 안에 있는 change-password.pug 를 가리킴
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword =  async (req, res) => {
  console.log('◆◆◆ postChangePassword --- req.body ---', req.body);

  // [ Mongo DB 명령어] mongo / show dbs / use wetube / show collections / db.sessions.remove({}) / db.users.remove({}) / db.users.find({})

  const {
    // middlewares.js 의 localsMiddleware 함수
    // [ Express-session 라이브러리 문법 ] 키값이 id 가 아니라 _id 임
    // 작업 01단계: 변경할 비밀번호 값을 알아도 그 값을 어느 사용자의 DB 값에 대해 업데이트 해야 하는지 모르면 비밀번호 변경 처리 불가하므로 로그인한 사용자을 식별해야 함

    // 방식A - [ Express-session 라이브러리 문법 ] middlewares.js 에서 로그인한 사용자 데이터가 담겨지는 부분의 코드인 console.log('로그인할 때 생성되는 res.session.userDbResult---------', req.session.userDbResult); 코드로 사용자 값에 대한 로그 결과물 속에서 키값이 id가 아닌 _id 임을 역추적으로 파악해낼 수 있어야 함
    // session: { userDbResult: { _id, password }},

    // 방식B
    session: {
      userDbResult: { _id },
    },

    // 작업 01단계: edit-profile.pug 의 form(method='POST') 이하 input 태그값에서 넘어온 값들
    body: { oldPassword: oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  // 작업 02단계: 로그인한 사용자의 session 에서 _id 값을 이용해 wetube DB 로부터 사용자 데이터 받아옴
  const user = await User.findById(_id);

  console.log('◆◆◆ postChangePassword --- await User.findById(_id); ---', user);

  // userController.js 의 postLogin 함수 내의 wetube DB 와 사용자 입력 비밀번호 일치여부 코드와 유사한 구조
  // [ Bcrypt 라이브러리 문법 ] postLogin 컨트롤러에서 로그인 처리를 위해 bcrypt.compare() 내장함수로 사용자 입력 비밀번호와 DB Hash 비밀번호 값이 동일한지 비교하기 위함
  // [ Bcrypt 라이브러리 문법 ] Hash 원리상 입력값이 동일하면 출력값이 항상 동일하므로 bcrypt.compare(사용자 입력값, DB Hash 처리된 값) 형태로 두 값을 비교하여 결과값으로 True/False 리턴함

  // 작업 03단계: 사용자가 비밀번호 변경 페이지(change-password.pug)에서 변경전 비빌번호로 입력한 값이 들어있는 oldPassword 와 wetube DB 에 들어있는 비밀번호 일치 여부 확인

  // 방식A - [ Bcrypt 라이브러리 & Mongoose 연계 문법] oldPassword 값은 change-password.pug 내의 input 값이 넘어온 것이고, password 값은 postChangePassword 함수 내에서 session 으로부터 가져온 사용자의 비밀번호 값임
  // const matchedPassword = await bcrypt.compare(oldPassword, password)

  // 방식B - [ Bcrypt 라이브러리 & Mongoose 연계 문법] oldPassword 값은 change-password.pug 내의 input 값이 넘어온 것이고, password 값은 postChangePassword 함수 내에서 await User.findById(_id) 로부터 가져온 사용자의 비밀번호 값임(즉, wetube DB 에 저장되어 있는 사용자의 비밀번호 값)
  const matchedPassword = await bcrypt.compare(oldPassword, user.password);
  console.log('◆◆◆ postChangePassword --- bcrypt.compare(oldPassword, user.password); --- ', matchedPassword);

  if (!matchedPassword) {
    // [ Pug 라이브러리 문법 ] views 폴더 이하에 pug 파일이 너무 많아져서 폴더로 카테고리화 하기 위해 views 폴더 이하에 users 폴더를 만들고 그 안에 change-password.pug 를 생성함
    // [ Pug 라이브러리 문법 ] return res.render('users/change-password', {생략}) 코드의 users/change-password 경로는 userRouter.js 내의 userRouter.route('/change-password').생략 코드와는 별개이며 pug 엔진이 참조하는 views 폴더 이하의 users 폴더 안에 있는 change-password.pug 를 가리킴
    // [ Express 라이브러리 문법 ] return res.render() 함수로 errorMessage 키값을 pug 템플릿에 전달하는 것은 사용자에게는 비밀번호 불일치 상황 이해시켰지만 브라우저는 여전히 오류 상황을 몰라 비밀번호 기기내 저장 팝업을 띄우므로 status(400) 코드를 첨가하여 브라우저도 오류 상황 인지하도록 코딩해야 함
    // TypeError: Cannot set properties of undefined (setting 'password')
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }

  // 작업 04단계: 비밀번호 변경값 일치 여부 확인
  if (newPassword !== newPasswordConfirmation) {
    // [ Pug 라이브러리 문법 ] views 폴더 이하에 pug 파일이 너무 많아져서 폴더로 카테고리화 하기 위해 views 폴더 이하에 users 폴더를 만들고 그 안에 change-password.pug 를 생성함
    // [ Pug 라이브러리 문법 ] return res.render('users/change-password', {생략}) 코드의 users/change-password 경로는 userRouter.js 내의 userRouter.route('/change-password').생략 코드와는 별개이며 pug 엔진이 참조하는 views 폴더 이하의 users 폴더 안에 있는 change-password.pug 를 가리킴
    // [ Express 라이브러리 문법 ] return res.render() 함수로 errorMessage 키값을 pug 템플릿에 전달하는 것은 사용자에게는 비밀번호 불일치 상황 이해시켰지만 브라우저는 여전히 오류 상황을 몰라 비밀번호 기기내 저장 팝업을 띄우므로 status(400) 코드를 첨가하여 브라우저도 오류 상황 인지하도록 코딩해야 함
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password doesn't match the confirmation.",
    });
  }

  // // 버전 AAA postChangePassword WITHOUT PRE('SAVE', ) ★★★★★★★★★★★★★★★★★★
  // const passwordUpdatedUser = await User.findByIdAndUpdate(_id, { password: await User.hashingPassword(newPassword) }, { new: true})
  // console.log('◆◆◆ pohstChangePassword --- passwordUpdatedUser ----', passwordUpdatedUser);
  // // req.session.loggedInUser.password = passwordUpdatedUser.password;
  // req.session.userDbResult.password = passwordUpdatedUser.password;
  // console.log('◆◆◆ req.session.userDbResult.password = passwordUpdatedUser --------', req.session.userDbResult.password);

  // 버전 BBB postChangePassword WITH PRE('SAVE', ) ★★★★★★★★★★★★★★★★★★
  // ??? ◆◆◆ 강좌 재확인요 ◆◆◆ --- 사용자가 변경한 비밀번호가 await User.findByIdAndUpdate() 통해 DB 에 저장될 때, hash 기법이 적용되지 않은 채로 비밀번호 원본값이 저장됨
  // ??? ◆◆◆ 강좌 재확인요 ◆◆◆ --- await passwordUpdatedUser.save(); 통해서 User.js 의 userSchema.pre('save', ) 함수가 동작할 것이라고 예상했으나, .findById() 가 아닌 .findByIdAndUpdate() 문법 때문인지 hash 함수를 거치지 않았음
  // const passwordUpdatedUser = await User.findByIdAndUpdate(_id, { password: newPassword }, { new: true})
  // console.log('◆◆◆ postChangePassword --- passwordUpdatedUser --- ', passwordUpdatedUser)
  // await passwordUpdatedUser.save();

      // req.session.loggedInUser.password = passwordUpdatedUser.password;
  // req.session.userDbResult.password = passwordUpdatedUser.password;


  // // 버전 CCC postChangePassword WITH PRE('SAVE', ) ★★★★★★★★★★★★★★★★★★
  // const existingUser = await User.findById({_id})
  // existingUser.password = newPassword;
  // console.log('◆◆◆ postChangePassword --- existingUser.password --- ', existingUser.password);
  // await existingUser.save();
  // // TypeError: Cannot set properties of undefined (setting 'password')
  // // req.session.loggedInUser.password = existingUser.password;
  // req.session.userDbResult.password = existingUser.password;
  
  console.log('◆◆◆ postChangePassword --- req.session --- ', req.session);
  console.log('◆◆◆ postChangePassword --- req.session.userDbResult --- ', req.session.userDbResult);
  
  // console.log('◆◆◆ postChangePassword --- req.session.loggedInUser.password --- ', req.session.loggedInUser.password);

  // 작업 05단계: [ Express-session & Mongoose & Bcrpyt 연계 문법 ] userController.js 의 postChangePassword 함수 내에서 session 속에 들어있는 사용자 식별값인 _id 값을 불러와서 그 사용자의 password 값에 newPassword 값을 대입해 비밀번호를 변경함
  // 방식A - 로그인한 사용자의 session 으로부터 사용자를 식별해 password 값에 newPassword 값을 대입하고자 await User.findById(_id) 코드로 wetube DB 검색함
  // console.log("old password -----", user.password);
  user.password = newPassword;

  // [ Bcrpyt 라이브러리 문법 ] 사용자에 의해 변경된 비밀번호를 wetube DB 에 업데이트 하기 전에 User.js 의 userSchema.pre('save', async function(){생략} 코드를 이용해 hash 적용시킴
  // console.log(
  //   "userController.js --- new unhashed password -----",
  //   user.password
  // );

  // 작업 06단계: [ Javascript 문법 ] DB 에 데이터를 저장하는 데는 시간이 걸리므로 async 함수 내에 await 명시요
  await user.save();

  // 방식A - [ Express-session & Bcrypt 연계 문법 ] 변경된 비밀번호에 대해 hash 처리 된 상태의 값인 user.password(즉, 현재값)를 req.session.user.password(즉,그때의 값)에도 반영시켜 session 속에 들어있는 password 값을 변경된 값으로 최신화시켜야 함
  req.session.userDbResult.password = user.password;

  // console.log("userController.js --- new password -----", user.password);
  // send notification

  // [ epxress-flash 문법 ] req.flash() 통해 홈페이지 통해 직접 가입한 사용자에게 비밀번호 변경 요청 처리 성공 알림 메시지 표시하여 상황 알림
  // [ express-flash 문법 ] 템플릿 (즉, Pug) 단에서 messages.직접작명한메시지유형명칭 으로 이 값을 받아서 표시해 주어야 브라우저 화면에 메시지 나타남
  req.flash('info', 'Password updated.');

  // 작업 07단계: wetube DB 상에서 비밀번호 변경 작업이 완료되었다면 사용자를 로그아웃시켜 변경된 비밀번호로 재로그인 하도록 redirect 시킴
  return res.redirect("/users/logout");
};

// delete는 JS 예약어라서 변수명으로 선언 불가, 변수명을 remove로 대체 선언
export const remove = (req, res) => res.send("Remove User ctrl");

export const logout = (req, res) => {

      // [ Express-session 라이브러리 연계 문법 ] 실질적인 로그아웃을 위해서는 req.session.destroy() 함수를 통해 세션을 종료시켜야 함
      // req.session.destroy();
  
  // - when I used "req.flash" after "req.session.destroy()",
  // the error was occurred because of destroyed session(Error: req.flash() requires sessions)
  // - If we use req.flash() we can't destroy sessions, instead we have to empty the req.session.user and req.session.isLoggedIn = false
  req.session.loggedIn = false;
  req.session.userDbResult = null;
  
  // [ epxress-flash 문법 ] req.flash() 통해 로그아웃 요청한 사용자에게 요청 처리 성공 알림 메시지 표시하여 상황 알림
  // [ express-flash 문법 ] 템플릿 (즉, Pug) 단에서 messages.직접작명한메시지유형명칭 으로 이 값을 받아서 표시해 주어야 브라우저 화면에 메시지 나타남
  req.flash('info', 'Bye Bye');
  
  return res.redirect("/");
};

// README.md 내용 /users/:id -> See User
// export const see = (req, res) => res.send("see user ctrl");
export const see = async (req, res) => {
  // [ Express 라이브러리 연계 문법 ] My Profile 페이지 연결은 비로그인 상태에서도 전체공개 페이지이므로 아무나 열람 가능하므로 userController.js 의 postLogin 함수 내의 req.session.userDbResult = userDbResult; 코드에서 생성된 session 내의 _id 값(즉, req.session.userDbResult._id)을 id 값으로 가져오는 것이 아님
  // [ Express 라이브러리 연계 문법 ] userRouter.js 의 userRouter.get("/:id", see); 라우팅 코드로부터 전달받은 id 파라미터 값(즉, URL 로부터 가져온 값)을 가져와야 함
  const { id } = req.params;

  // [ Mongoose 연계 문법 ] URL 에 있는 id 파라미터를 이용해 사용자를 찾아야 함 (즉, My Profile 페이지 연결은 비로그인 상태에서도 전체공개 페이지이기 때문에 session 내의 _id 값(즉, req.session.userDbResult._id) 으로 사용자 정보를 찾지 않음)
  // [ Mongoose 연계 문법 ] Relationship 작업B - 2차버전간결코드 <즉, Mongoose 의 .populate('videos') 곁들인> ) 1차버전장황코드 DB 초기화 선행요 / 사용자가 업로드한 모든 video 목록 보여주기: User 모델에 video list(즉, 여러 개의 video 목록) 양단 연결하는 array 형식의 스키마 추가요
  // [ Mongo DB & Mongoose 연계 문법 ★★★] 이처럼 Video 모델과 User 모델을 연결하는 스키마와 controller 를 만들려면 우선적으로 mongo 콘솔 명령어 db.users.remove({}) 와 db.videos.remove({}) 를 실행해 두 개의 collection (즉, users 와 videos) 를 모두 삭제(즉, 초기화) 해야 함
  // [ Mongoose 문법 ] userController.js 의 see 함수 내의 const userProfileDbResult = await User.findById(id) 코드였을 때는 userProfileDbResult.videos 에 _id 값(String 형태)만 담기는 형태였는데 .populate('videos') 속성을 추가로 연결하면 videos 에 video 모델 스키마에 기반한 DB 값(array 형태의 Object 값들)이 담기게 됨
  // [ Mongoose 문법 ] 즉, .populate('videos') 코드를 추가로 연결하면 Mongoose 가 _id 를 찾고 그 안에서 videos 도 찾아 줌
  // const userProfileDbResult = await User.findById(id).populate('videos');
  const userProfileDbResult = await User.findById(id).populate({
    path: "videos",
    populate: {
      // #10.2 Styles Part Two 깃헙강의코드북붙했으니재확인요
      // [ Mongoose 문법 ] Double Populate 기법은 .populate({ populate: { } }) 구조를 말함
      // [ Mongoose 문법 ] /views/mixins/video.pug 에서 span #{videoItem.owner.name} 코드를 통해 영상별 게시자명을 보여주려다 보니 특정 사용자가 올린 영상들에 대한 세부 정보를 얻어오기 위해 videos 에 대한 populate 실시 후 각 영상들에 대해 User 모델을 참조해 Video 모델의 owner 항목에 대한 세부정보를 얻어오기 위해 populate 함
      /*
      // #10.3 수강생 보완 코드 (기재된 변수명은 내 코드와 상이)
      Double populate를 사용하지 않고도 가능합니다.
      profile.pug 에서 templates로 user가 넘어가기때문에
      video.mixin에서 span #{video.owner.username} • 이부분의 값이 없습니다.
      따라서 해당 부분을 span #{video.owner.username || user.username} • 으로 수정해주시면 Profile Page에서도 video의 User name을 확인할 수 있습니다.
      */
      path: "owner",
      model: "User",
    },
  });

  console.log(
    "userController.js ------- see ----- userProfileDbResult",
    userProfileDbResult
  );

  // [ Express 라이브러리 연계 문법 & Mongo DB ] wetube DB 에 userController.js 의 postJoin 함수 내의 await User.create({}) 쿼리문 실행 결과로 Mongo DB 에 의해 자체 부여된 _id 값으로 await User.findById(id); 쿼리 검색결과가 없을 때 return res.status(404).render('404', {}) 형태로 에러를 발생시키고 404.pug 템플릿으로 연결시켜야 함
  if (!userProfileDbResult) {
    // [ Mongoose 연계 문법 ] Relationship 작업A - Video 모델에 유일한 owner 명시하여 양단 연결하는 스키마 추가요
    // [ Mongoose 연계 문법 ] Relationship 작업B - 1차버전장황코드) 사용자가 업로드한 모든 video 목록 보여주기: 사용자의 _id 를 owner 로 가진 video list(즉, 여러 개의 video 목록) 찾기 (userController.js 의 see 함수 내의 const videos = await Video.find({ owner: userProfileDbResult._id}); 코드로 처리)
    // [ Mongoose 연계 문법 ] Relationship 작업B - 2차버전간결코드 <즉, Mongoose 의 .populate('videos') 곁들인> ) 1차버전장황코드 DB 초기화 선행요 / 사용자가 업로드한 모든 video 목록 보여주기: User 모델에 video list(즉, 여러 개의 video 목록) 양단 연결하는 array 형식의 스키마 추가요
    // [ Mongo DB & Mongoose 연계 문법 ★★★] 이처럼 Video 모델과 User 모델을 연결하는 스키마와 controller 를 만들려면 우선적으로 mongo 콘솔 명령어 db.users.remove({}) 와 db.videos.remove({}) 를 실행해 두 개의 collection (즉, users 와 videos) 를 모두 삭제(즉, 초기화) 해야 함
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }

  // [ Mongoose 연계 문법 ] Relationship 작업B - 1차버전장황코드) 사용자의 _id 를 owner 로 가진 video list(즉, 여러 개의 video 목록) 찾기
  // [ Mongoose 연계 문법 ] 즉, video 의 params 의 id 와 같은 영상들을 찾기
  // [ Mongoose 연계 문법 ] 즉, video 의 owner 의 ID 가 URL(즉, /users/MongoDB자체부여한_id값) 에 있는 ID 값(즉, userController.js 의 see 함수 내의 userProfileDbResult._id 값)과 같은 영상들을 찾기
  // const videos = await Video.find({ owner: userProfileDbResult._id});
  // console.log('userController.js ------- see ----- videos', videos);
  // return res.render('users/profile', { pageTitle: `${userProfileDbResult.name}의 Profile`, userProfileDbResult, videos})

  return res.render("users/profile", {
    pageTitle: `${userProfileDbResult.name}의 Profile`,
    userProfileDbResult,
  });
};

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가
//export default join;
