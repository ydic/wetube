const fakeUser = {
  username: 'Ryan',
  loggedIn: true,
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

// #6.0 수업영상에서 자료형을 const에서 let으로 변경함
// trending 내부에 있던 array 데이터 코드를 밖으로 빼내어 적었으므로 모든 Controller에서 Array 데이터를 사용할 수 있음
let fakeArrayVideos = [
  { title: "First Video",
    rating:5,
    comments:1,
    createdAt: "2 minutes ago",
    views: 0,
    id: 1,
  },
  { title: "Second Video",
    rating:4,
    comments:22,
    createdAt: "22 minutes ago", 
    views: 1,
    id: 2,
  },
  { title: "Third Video",
    rating:3,
    comments:32,
    createdAt: "32 minutes ago",
    views: 2,
    id: 3,
  },
];

export const trending = (req, res) => {

  // 질문???? Javascript ES6 문법?? 기본적으로 {key: value} 형태로 적는데 {key: object}??? (fakeUser: fakeUser) {key: array}??? videosObjInArr: videosObjInArr
  return res.render("home", {pageTitle: 'Home', fakeUser: fakeUser, fakeArrayVideos: fakeArrayVideos})
};

/* 
// 구버전 코드
export const trending = (req, res) => res.render("home", {pageTitle : 'Home'});
*/

export const search = (req, res) => res.send('search video ctrl')

// pug js 맞물림 재확인요: const see? render watch? 이름 통일요?
// videoRouter.js 파일에서 import하여 사용함


// [express 문법] URL 안에 변수를 넣도록 해주는 파라미터(예- :id) 
// [express 문법] 파라미터(예- :id) 덕분에 모든 video마다 videoRouter를 새로 만들 필요 없어짐
// 예시: videoRouter.get('/1', see1); videoRouter.get('/2', see2);
export const watch = (req, res) => {

  const idVideo = req.params.id;
  const video = fakeArrayVideos[idVideo -1];
  
  // [ 질문 ] ??? res 응답할 때 return 붙이고 안붙이고 실행결과 차이? 어떤 것이 옳은 문법? 왜?

  return res.render('watch', { pageTitle: `Watching ${video.title}`, video});  
}

// getEdit 함수는 브라우저에 form을 보여줌
export const getEdit = (req, res) => {
  const idVideo = req.params.id;
  const video = fakeArrayVideos[idVideo -1];

  return res.render('edit', { pageTitle: `Editing ${video.title}`, video});
};

// postEdit 함수는 변경사항을 저장해줌
export const postEdit = (req, res) => {
  const idVideo = req.params.id;
  
  // [ Express 문법 ] express 스스로는 form의 body(즉, value)를 처리할 줄 모름. 
  // [ Express 문법 ] route들을 사용하기 전에 middleware를 사용해야 함
  // [ Express 문법 ] server.js에서 express.urlencoded() 내장함수를 middleware로써 기능하도록 app.use(express.urlencoded( { extended: true } )); 라고 코딩하여 express에게 form을 처리하고 싶다고 알려주면 Javascript 형식으로 변형시켜줘서 우리가 사용할 수 있게 됨
  const titleVideo = req.body.titleVideoInput;
  
  // [ 주의 : mutation, Javascript, object 작동원리 ] Javascript에서 가짜 DB가 실제로 업데이트되지는 않음(즉, 서버 재시작하면 메모리 휘발). 단지, 코드 논리로는 아래 코드와 같이 작성하면 가짜 DB인 fakeArrayVideos에 사용자가 바꾼 제목으로 title이 바뀌어짐
  fakeArrayVideos[idVideo -1].title = titleVideo;

  // console.log(idVideo);
  // console.log(titleVideo);
  // console.log(fakeArrayVideos[idVideo-1]);

  return res.redirect(`/videos/${idVideo}`);
};

// [ Express 문법 ] express 스스로는 form의 body를 처리할 줄 모름. express.urlencode() 내장함수를 통해 express에게 form을 처리하고 싶다고 알려줘야 함

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가
//export default trending;

export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: "Upload Video"})
}

export const postUpload = (req, res) => {
  // here we will add a video to the videos array
  console.log(req.body);

  // Pug 코드의 form 태그 내의 input 태그에 name 속성으로 명명해 주어야 POST submit한 값이 key: value 형태로 req.body에서 포착 가능함
  const titleVideoUpload = req.body.titleVideoUploadInput;

  const fakeNewVideo = {
    title: titleVideoUpload,
    rating:0,
    comments:0,
    createdAt: "just now",
    views: 0,
    id: fakeArrayVideos.length +1,
  }

  fakeArrayVideos.push(fakeNewVideo);

  return res.redirect('/');
}

