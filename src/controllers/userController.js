// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴
// express 엔진은 NodeJS를 실행시켜주는 package.json 파일 위치(cwd) 기준으로 views 폴더(src/views)를 바라보기 때문에 별도의 import, export 불필요

// pug 파일 가리킬 때 res.render('따옴표 포함한 pug파일명') 입력해야 TypeError: View is not a constructor 에러 안 생김

/*
export const join = (req, res) => res.send("Join");
export const edit = (req, res) => res.send("Edit User ctrl");
*/

// server.js 파일에서 import하여 사용함
export const join = (req, res) => res.render('join');

export const login = (req, res) => res.send('login ctrl');

// videoRouter.js 파일에서 import하여 사용함
export const edit = (req, res) => res.send("Edit User ctrl");

// delete는 JS 예약어라서 변수명으로 선언 불가, 변수명을 remove로 대체 선언
export const remove = (req, res) => res.send("Remove User ctrl");
export const logout = (req, res) => res.send("logout User ctrl");

// README.md 내용 /users/:id -> See User
export const see = (req, res) => res.send("see user ctrl");

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가
//export default join;