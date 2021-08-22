const fakeUser = {
  username: 'Ryan',
  loggedIn: false,
};

// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴
// express 엔진은 NodeJS를 실행시켜주는 package.json 파일 위치(cwd) 기준으로 views 폴더(src/views)를 바라보기 때문에 별도의 import, export 불필요

// pug 파일 가리킬 때 res.render('따옴표 포함한 pug파일명') 입력해야 TypeError: View is not a constructor 에러 안 생김

/*
export const watch = (req, res) => res.send("Watch Video ctrl");
export const edit = (req, res) => res.send("Edit Video ctrl");
*/

// pug js 맞물림 재확인요: const trending? render home? 이름 통일요?
// server.js 파일에서 import하여 사용함
// 오브젝트 표기 틀린 문법은 #{p : H} 또는 {p: H}, 맞는 문법은 {p: 'H'}

/*
// ??? wetube 5.7레슨 코드 yd자체변형(js -> pug) 에러 원인 커뮤니티 질문요
const fakeUser = {
  username: 'Ryan',
  loggedIn: true,
};
let checkLogin = fakeUser.loggedIn;
export const trending = (req, res) => res.render("home", {pageTitle: 'Home'}, checkLogin);
*/


export const trending = (req, res) => {
  const videosObjInArr = [
    { title: "First Video",
      rating:5,
      comments:2,
      createdAt: "2 minutes ago",
      views: 59,
      id: 1,
    },
    { title: "Second Video",
      rating:4,
      comments:22,
      createdAt: "22 minutes ago", 
      views: 259,
      id: 2,
    },
    { title: "Third Video",
      rating:3,
      comments:32,
      createdAt: "32 minutes ago",
      views: 359,
      id: 3,
    },
  ];

  // 질문???? Javascript ES6 문법?? 기본적으로 {key: value} 형태로 적는데 {key: object}??? (fakeUser: fakeUser) {key: array}??? videosObjInArr: videosObjInArr
  return res.render("home", {pageTitle: 'Home', fakeUser: fakeUser, videosObjInArr: videosObjInArr})
};
// export const trending = (req, res) => res.render("home", {pageTitle : 'Home'});

export const search = (req, res) => res.send('search video ctrl')

// pug js 맞물림 재확인요: const see? render watch? 이름 통일요?
// videoRouter.js 파일에서 import하여 사용함

export const upload = (req, res) => res.send('upload video ctrl');

export const deleteVideo = (req, res) => res.send('delete video ctrl');


// [express 문법] URL 안에 변수를 넣도록 해주는 파라미터(예- :id) 
// [express 문법] 파라미터(예- :id) 덕분에 모든 video마다 videoRouter를 새로 만들 필요 없어짐
// 예시: videoRouter.get('/1', see1); videoRouter.get('/2', see2);
export const see = (req, res) => res.render('watch', {idVideo : req.params.id});
export const edit = (req, res) => res.render('edit');

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가
//export default trending;
