// [ Express-session 라이브러리 연계 문법 ] 주의: server.js에서 localsMiddleware가 코드 순서상 Express-session middleware ( 즉, app.use(session({}) )다음에 오기 때문에 가능함
export const localsMiddleware = (req, res, next) => {
  
  // [ Express-session 라이브러리 연계 문법 ] 사용자가 로그인하면 그 사용자에 대한 정보를 session에 담기 (각 사용자(브라우저)마다 서로 다른 req.session 오브젝트(즉, 서로 다른 세션ID)를 갖고 있음)
  // userController.js의 postLogin 컨트롤러 코드에 req.session.loggedIn = true; req.session.userDbResult = userDbResult; 형태로 사용자 정보를 별도로 추가함

  console.log('localMiddleware---------',req.session);

  // [ Express-session 라이브러리 연계 문법 ] Pug 템플릿에서 req.session.loggedIn 형태로는 session에 접근 불가. 별도의 전용 문법 없이 locals 활용해 접근 가능.
  // [ Express-session 라이브러리 연계 문법 ] req.session.loggedIn 값이 undefiend 또는 False일 수도 있으니 Boolean() 형식으로 감싸서 True/False 여부 확인함
  res.locals.loggedIn = Boolean(req.session.loggedIn);

  res.locals.siteNameByLocals = 'Wetube';

  console.log('res.locals------------',res.locals);

  // [ Express-session 라이브러리 연계 문법 ] userDbResult 정보를 locals로 전달(공유)해서 Pug 파일에서 그 값을 사용자에게 보여줌 (예- a(href="") #{loggedInUser.name} 님의 Profile)
  // [ Express-session 라이브러리 연계 문법 ] req.session.userDbResult 초기값은 로그인 전이므로 undefined 상태임 (userController.js의 postLogin 컨트롤러 코드 내에서 로그인 절차 검증 후 req.session.loggedIn = true; req.session.userDbResult = userDbResult; 형태로 session에 사용자 정보가 담기도록 했음. Pug 템플릿에서 이 정보를 활용해 사용자 정보를 화면 내용 맥락에 맞게 재사용.
  res.locals.loggedInUserDb = req.session.userDbResult;

  // 주의: next()를 호출하지 않으면 웹사이트가 정상 작동하지 않음
  next()
}