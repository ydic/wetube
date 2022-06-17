// [ Multer 라이브러리 문법 ] ReferenceError: multer is not defined
// [ Multer 라이브러리 문법 ] Multer는 파일 업로드를 위해 사용되는 multipart/form-data 를 다루기 위한 node.js 의 미들웨어 입니다. 효율성을 최대화 하기 위해 busboy 를 기반으로 하고 있습니다.
// [ Multer 라이브러리 문법 ] 주: Multer는 multipart (multipart/form-data)가 아닌 폼에서는 동작하지 않습니다.
import multer from 'multer';

// [ Express-session 라이브러리 연계 문법 ] 주의: server.js에서 localsMiddleware가 코드 순서상 Express-session middleware ( 즉, app.use(session({}) )다음에 오기 때문에 가능함
export const localsMiddleware = (req, res, next) => {
  
  // [ Express-session 라이브러리 연계 문법 ] 사용자가 로그인하면 그 사용자에 대한 정보를 session에 담기 (각 사용자(브라우저)마다 서로 다른 req.session 오브젝트(즉, 서로 다른 세션ID)를 갖고 있음)
  // userController.js의 postLogin 컨트롤러 코드에 req.session.loggedIn = true; req.session.userDbResult = userDbResult; 형태로 사용자 정보를 별도로 추가함

  // * * * * 주의: next()를 호출하지 않으면 웹사이트가 정상 작동하지 않음
  // console.log('localMiddleware---------',req.session);

  // [ Express-session 라이브러리 연계 문법 ] Pug 템플릿에서 req.session.loggedIn 형태로는 session에 접근 불가. 별도의 전용 문법 없이 locals 활용해 접근 가능.
  // [ Express-session 라이브러리 연계 문법 ] userContoller.js의 postLogin 컨트롤러 내의 req.session.loggedIn 값이 undefiend 또는 False일 수도 있으니 Boolean() 형식으로 감싸서 True/False 여부 확인함
  // [ Express-session 라이브러리 연계 문법 ] middlewares.js의 localsMiddleware 함수 내의 res.locals.loggedIn = Boolean(req.session.loggedIn); 코드 값을 base.pug에서 별도의 전용 문법 없이 loggedIn 이라는 이름으로 접근함
  res.locals.loggedIn = Boolean(req.session.loggedIn);

  res.locals.siteNameByLocals = 'Wetube';

        // console.log('res.locals------------',res.locals);

  // [ Express-session 라이브러리 연계 문법 ] userDbResult 정보를 locals로 전달(공유)해서 Pug 파일에서 그 값을 사용자에게 보여줌 (예- a(href="") #{loggedInUserDb.name} 님의 Profile)
  // [ Express-session 라이브러리 연계 문법 ] req.session.userDbResult 초기값은 로그인 전이므로 undefined 상태임 (userController.js의 postLogin 컨트롤러 코드 내에서 로그인 절차 검증 후 req.session.loggedIn = true; req.session.userDbResult = userDbResult; 형태로 session에 사용자 정보가 담기도록 했음. Pug 템플릿에서 이 정보를 활용해 사용자 정보를 화면 내용 맥락에 맞게 재사용.
  // [ Express-session 라이브러리 연계 문법 ] userContoller.js의 polstLogin 함수 내의 ?? 단의 req.session.userDbResult 값이 서버DB? 메모리? 브라우저?단에 담겼다가 res.locals.loggedInUserDb 응답을 통해 Pug 템플릿의 a(href="/my-profile") #{loggedInUserDb.name} 님의 Profile 표현에 활용됨
  // [ Express-session 라이브러리 연계 문법 ] middlewares.js의 localsMiddleware 함수 내의 res.locals.loggedInUserDb = req.session.userDbResult; 코드 값을 base.pug에서 별도의 전용 문법 없이 loggedInUserDb.name 이라는 이름으로 접근함
  // [ 시큐어 보안 코딩 ] 비로그인 상태의 사용자가 로그인 된 사용자에게만 보이는 Edit-Profile 하이퍼링크조차 브라우저에 나타나지 않는 상황에서 사용자 정보 변경 페이지 URL 값을(즉, /users/edit) 직접 주소입력창에 입력하여 진입 시도할 때, 해당 URL 경로에 대한 접근을 제한시켜야 함(예- 리다이렉트 시키기)
  // [ 시큐어 보안 코딩 & Express-session 라이브러리 연계 문법 ] loggedInUserDb 에 접근하려는데 비로그인 상태이면 발생하는 에러에 대해 req.session.userDbResult || {}; 코드는 or 조건자와 빈 오브젝트(즉, {}, empty object) 를 덧붙여서 session 내의 user 값이 비어있는 상태일 때(즉, 사이트 방문자가 비로그인 상태일 때) loggedInUser 값이 undefined 여서 발생하게 되는 cannot read property '무언가' of undefined 오류를 방지할 수 있음
  res.locals.loggedInUserDb = req.session.userDbResult || {};
        // console.log('로그인할 때 생성되는 res.session.userDbResult---------', req.session.userDbResult);
  
  // * * * * 주의: next()를 호출하지 않으면 웹사이트가 정상 작동하지 않음
  next()
}

// [ 시큐어 보안 코딩 ] middlewares.js 의 protectorMiddleware 함수로 비로그인 사용자가 로그인 승인 필요한 페이지(로그인된 사용자 전용)에 접근하지 못하도록 제한하기
export const protectorMiddleware = (req, res, next) => {
  // [ Express-session 라이브러리 문법 ] loggedIn 이라는 명칭은 본 프로젝트에서 명명했고 사용자가 로그인하면 session 내에 true 값으로 저장되는 정보임. session 내에 저장되므로 어느 controller나 middleware에서도 해당 값을 사용할 수 있음
  if(req.session.loggedIn){
    // [ 시큐어 보안 코딩 ] middleware 함수 성격이 있으므로 로그인 사용자(즉, loggedIn 값이 true)를 next() 처리하여 다음 작업으로 통과시킴
    return next();
  } else {
    // [ 시큐어 보안 코딩 ] 비로그인 사용자를 /login 페이지로 redirect 함
    // [문법 오타 오류] TypeError: res.redierct is not a function
    return res.redirect('/login');
  }
}

// [ 시큐어 보안 코딩 ] protectorMiddleware 함수와는 상반되는 구성. 비로그인 사용자라면 next() 처리하여 다음 작업으로 통과시키고 로그인 사용자(즉, loggedIn 값이 true)라면 / (즉, 홈)으로 redirect 시킴
export const publicOnlyMiddleware = (req, res, next) => {
  if(!req.session.loggedIn){
    return next();
  } else {
    return res.redirect('/');
  }
}

// [ Multer 라이브러리 문법 ] export const ABC = (req, res) => {} 형식의 코드를 사용하지 않음
// [ Multer 라이브러리 문법 ] middlewares.js 파일이 있는 디렉토리에 uploads 라는 폴더가 생성됨
// [ Multer 라이브러리 문법 ] dest 속성은 업로드한 파일을 저장할 경로 설정을 담당하므로 사용자가 보낸 파일을 uploads 폴더에 저장하도록 설정된 middleware 를 만듦
            // export const uploadFiles = multer({ dest: 'uploads/' })

// [ Multer 라이브러리 문법 ] MulterError: File too large --- fileSize 속성 (in bytes 즉, 단위는 바이트 / 이진법? 십진법?) 영문 설명: for multipart forms, the max file size (in bytes)

export const avatarUpload = multer({ dest: 'uploads/avatars/', limits: { fileSize: 3000000, }, });
export const videoUpload = multer({ dest: 'uploads/videos/', limits: { fileSize: 10000000, }, });