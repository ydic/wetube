/*
    // [ Mongoose 문법 ] Javascript 문법인 export, import를 활용해 샵(#) 달아주기 코드를 save와 update 컨트롤 함수에서 불러와 사용해도 되지만, 몽구스 내장함수인 videoSchema.static(이름, 함수)를 활용해서 save와 update 작업에서의 샵(#) 달아주기를 처리할 수도 있다
    import Video, { formatHashtags } from '../models/video';
*/

// Video.js에서 export default Video; 한 것을 import 함
import User from "../models/User";
import Video from "../models/video";

// Controller 모듈 코드 내의 res.render를 통해 views 폴더 이하의 pug파일을 html 코드로 render하여 받아옴
// express 엔진은 NodeJS를 실행시켜주는 package.json 파일 위치(cwd) 기준으로 views 폴더(src/views)를 바라보기 때문에 별도의 import, export 불필요

// pug 파일 가리킬 때 res.render('따옴표 포함한 pug파일명') 입력해야 TypeError: View is not a constructor 에러 안 생김

// pug js 맞물림 재확인요: const trending? render home? 이름 통일요?
// server.js 파일에서 import하여 사용함
// 오브젝트 표기 틀린 문법은 #{p : H} 또는 {p: H}, 맞는 문법은 {p: 'H'}

// fake ver #6.0 수업영상에서 자료형을 const에서 let으로 변경함
// fake ver trending(신 home) 내부에 있던 array 데이터 코드를 밖으로 빼내어 적었으므로 모든 Controller에서 Array 데이터를 사용할 수 있음

// export const home = (req, res) => {
export const home = async (req, res) => {
  // [ Mongoose 문법 ] .find는 { *** search terms *** }를 db에서 불러온 다음 *** callback(err, docs) *** 값을 불러온다
  /*
      const handleSearch = (error, videos) => {
        console.log('errors', error);
        console.log('videos', videos);

        if(error) {
          return res.render('server-error', {error})
        }

        // 질문???? Javascript ES6 문법?? 기본적으로 {key: value} 형태로 적는데 {key: object}??? (fakeUser: fakeUser) {key: array}??? videosObjInArr: videosObjInArr
        // [ Mongoose 문법 ] db 검색이 안 끝났을 때 render 되는 걸 방지하기 위해 .find 내장함수의 callback 함수 내에 render 코드 위치시킴 (그러나 function 안에 function을 넣어야 하는 단점)
        // [ Express 문법 ] 주의: function 안(구체적으로는 함수A 안의 함수B)에서 return은 그냥 function을 마무리할 뿐임. (즉, 함수A에서 return 되는 건 전혀 없음)
        // [ Express 문법 ] return의 순기능은 return 이하의 코드는 비활성 코드가 되며 function을 return 동작을 끝으로 종료시킴
        
        return res.render("home", {pageTitle: 'Home', realArrayVideos: videos})
      }
    
      Video.find({}, handleSearch);
    */

  try {
    // [ Mongoose 문법 ] await 표시한 .find() 내장함수는 callback을 필요로 하지 않는다는 것을 알고, 찾아낸 비디오를 바로 출력함. await가 db로부터 결과값을 받을 때까지 기다려 줌. (주의: error 처리는 try {} catch {} 문으로 보완)
    // [ Mongoose 문법 ] .sort({ key : value }) 내장함수를 통해 데이터(즉, db model)를 정렬할 수 있음
    // const videos = await Video.find({}).sort({ createdAt: 'desc'});
    // #10.2 Styles Part Two 깃헙강의코드북붙했으니재확인요
    // [ Mongoose 문법 ] await Video.find({}) 쿼리 결과에는 Video.js 모델 스키마에 따라 owner 항목에 Object 형식의 ObjcetId 값이 검색되는데, .populate("owner") 속성을 체인 걸어서 검색하면, 모든 영상의 owner 항목 내 ObjectId 값의 상세한 key, value 값들이 모두 담기게 되며 Pug 의 mixin 기능이 반영된 social-login.pug 에서 span #{videoItem.owner.name} 형태로 해당 영상 게시자명을 보여주게 됨
    const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");

    console.log("videoController.js ---- home ---- videos", videos);

    return res.render("home", { pageTitle: "Home", realArrayVideos: videos });
  } catch {
    return res.render("server-error", { error });
  }
};

export const search = async (req, res) => {
  // [ Express 문법 ] req.query 내장함수를 통해 input 태그에서 입력한 검색 키워드(GET 요청)를 받아올 수 있음

  const { keyword } = req.query;

  // search.pug 페이지의 keyword 초기값은 사용자 검색키워드 submit 이전이므로 undefined 상태임
  // keyword가 undefined 상태가 아니라면 해당 값으로 검색 작업 시행해서 searchResults 배열에 담기도록 함
  let searchResults = [];
  if (keyword) {
    searchResults = await Video.find({
      title: {
        // [ 정규표현식 문법 MongoDB ] $regex는 MongoDB가 제공하는 여러 operator 중에 한 가지임 / 예- { <field> : { $regex: 정규표현 관련 설정(문서 재참고요) } }
        // [ 정규표현식 문법 Javascript ] new RegExp(PATTERN, FLAGS)
        // [ 정규표현식 문법 Javascript ] i는 ignore case이며 영문 대소문자 구분하지 않는 속성임
        $regex: new RegExp(keyword, "i"),
      },
      // #10.2 Styles Part Two 깃헙강의코드북붙했으니재확인요
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", searchResults });
};

// pug js 맞물림 재확인요: const see? render watch? 이름 통일요?
// videoRouter.js 파일에서 import하여 사용함

// [express 문법] URL 안에 변수를 넣도록 해주는 파라미터(예- :id)
// [express 문법] 파라미터(예- :id) 덕분에 모든 video마다 videoRouter를 새로 만들 필요 없어짐
// 예시: videoRouter.get('/1', see1); videoRouter.get('/2', see2);
export const watch = async (req, res) => {
  const idVideo = req.params.id;

  // [ Mongoose 문법 ] <db model>.findById 내장함수를 통해 id로 데이터(즉, 영상)을 찾아낼 수 있음
  // [ Javascript 문법 ] async await 문법을 적용하여 .findById 내장함수가 데이터를 찾아주는 시간을 기다리도록 함
  // [ Mongoose 문법 ] .exec() 내장함수는 query를 실행시키고 promise를 return 해줌. (async, await 사용중이라면 .exec() 내장함수 표기하지 않아도 .findByID() 단독으로도 query 실행 가능함)

  // [ Mongoose 연계 문법 ] 기능02: (video.js 코드부터 참조요) 영상 재생 페이지에 비디오 업로더 이름 표기하는 기능
  // [ Mongoose 연계 문법 ] video.js 의 Video 모델 스키마 지정 부문에서 new mongoose.Schema({ owner: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'User'} }) 라는 내용을 추가하여 owner 에 대해 ObjectId 유형으로 _id 식별할 수 있게 미리 지정해 놓았음
  // const videoOwner = await User.findById(video.owner);

  // const video = await Video.findById(idVideo)
  // [ Mongoose 문법 ] videoController.js 의 watch 함수 내의 const video = await Video.findById(idVideo) 코드였을 때는 video.owner 에 _id 값(String 형태)만 담기는 형태였는데 .populate('owner') 속성을 추가로 연결하면 owner 에 user 모델 스키마에 기반한 DB 값(Object 형태)이 담기게 됨
  // [ Mongoose 문법 ] 즉, .populate('owner') 코드를 추가로 연결하면 Mongoose 가 video 를 찾고 그 안에서 owner 도 찾아 줌
  const video = await Video.findById(idVideo).populate("owner");

  console.log(
    "videoController.js ------ watch ----- video >>>>>> Pug -----",
    video
  );

  // 에러 나는 경우를 먼저 if로 처리해주고 else에는 정상적인 케이스에 작동할 코드를 담으면 됨
  // 사용자가 존재하지 않는 페이지를 검색할 경우도 대비해 return res.render(PUG 파일 (즉,404 관련)) 적절한 응답처리 페이지 만들어놓아야 함

  if (video === null) {
    // if(!video) {

    // ??? [ 주의 ] videoRouter.js의 정규표현식 /:id[0-9a-f]{24} 덕분에 몽고DB? 몽구스? ObjectID 24자리값을 인식하고 다룰 수 있게 됐지만, 글자수 24자이면서 오타(존재하지 않는 ID)는 videoRouter에서 404.pug로까지 데이터 넘어오지만, 글자수 24자 아닌(23이하, 25 이상) 오타값에 대한 페이지 검색시에는 여전히 cannot GET 응답 없는 페이지 나옴. 이 부분도 별도 처리 필요.
    // [ Javascript 문법 ] function을 끝내야 하므로 if문 안에 return 표기를 반드시 명시해야 함

    // 404 Not Found 클라이언트 오류(서버가 요청받은 리소스를 찾을 수 없다)
    // [ Express 문법 ] return res.render('404', { pageTitle: 'Video not found.'}); 라고만 처리하면 사용자에게는 오류 맥락을 이해시켰지만 브라우저는 상태 응답 코드 200을 받은 상태로 남게 됨. 브라우저도 오류 상황으로 처리할 수 있도록 .status() 문법으로 상태 코드를 명시해야 함. 그러면 morgan 미들웨어(즉, app.use(logger);) 통해 서버 로그 상에 404 이라고 표시됨

    return res.status(404).render("404", { pageTitle: "Video not found." });
  } else {
    // [ 질문 ] ??? res 응답할 때 return 붙이고 안붙이고 실행결과 차이? 어떤 것이 옳은 문법? 왜?

    // 존재하지 않아 유효하지 않은 id(24바이트 16진수) 값으로 접속 시도하면 영상 검색에 실패했으므로 "비디오는 null이고 null은 title을 갖고 있지 않습니다" --- TypeError: Cannot read property 'title' of null
    // [ Mongoose 연계 문법 ] 기능02: (video.js 코드부터 참조요) 영상 재생 페이지에 비디오 업로더 이름 표기하는 기능
    // [ Mongoose 연계 문법 ] Video 모델 스키마에 기반해 저장된 owner 의 _id 값(즉, postJoin 함수 내의 await User.create({}) 쿼리문에 의해 Mongo DB 자동 부여한 _id 값) 을 기반으로 videoController.js 의 watch 함수 내에서 해당 영상 업로드 한 사용자에 대한 정보를 const videoOwner = await User.findById(video.owner); 쿼리문으로 videoOwner 에 담은 후 Pug 템플릿으로 전달함
    // return res.render('watch', { pageTitle: video.title, video, videoOwner});
    return res.render("watch", { pageTitle: video.title, video });
  }
};

// getEdit 함수는 브라우저에 form을 보여줌
export const getEdit = async (req, res) => {
  const idVideo = req.params.id;

  // 대문자 Video는 Video.js에서 Schema 정의한 Mongoose Model임
  // 소문자 video는 db에서 검색한 영상 object임(title, description, hashtags, ...)

  const video = await Video.findById(idVideo);

  const {
    userDbResult: { _id },
  } = req.session; // 표기효율성 증진용

  if (!video) {
    // 404 Not Found 클라이언트 오류(서버가 요청받은 리소스를 찾을 수 없다)
    // [ Express 문법 ] return res.render('404', { pageTitle: 'Video not found.'}); 라고만 처리하면 사용자에게는 오류 맥락을 이해시켰지만 브라우저는 상태 응답 코드 200을 받은 상태로 남게 됨. 브라우저도 오류 상황으로 처리할 수 있도록 .status() 문법으로 상태 코드를 명시해야 함. 그러면 morgan 미들웨어(즉, app.use(logger);) 통해 서버 로그 상에 404 이라고 표시됨
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }

  // [ 시큐어 보안 코딩 ★★★ ] 사용자A 가 올린 동영상이라서 watch.pug(즉, 프론트엔드) 에서 사용자A 에게만 해당 영상 게시물의 edit 페이지 및 기능과 delete 기능(즉, videoController.js 의 getEdit 함수, postEdit 함수, deleteVideo 함수)에 접근할 수 있는 링크(즉, a 태그) 를 보여주는 방식 만으로는 접근 제한 보안성 취약함
  // [ 시큐어 보안 코딩 ★★★ ] 사용자B 가 직접 URL 경로 입력(즉, http://localhost:4000/videos/동영상랜덤파일명/edit)을 통해 사용자A 가 올린 동영상 게시물의 edit 페이지 및 기능과 delete 기능(즉, videoController.js 의 getEdit 함수, postEdit 함수, deleteVideo 함수)에 접근 및 사용할 수 있는 보안취약점이 있음
  // [ 시큐어 보안 코딩 ] video.owner(즉, 영상 게시자)와 req.session.userDbResult._id(즉, 현재 로그인한 사용자)가 동일한 인물인지 검증해서 거짓이라면 Forbidden 상태코드 발생시켜 메인페이지로 강제 이동시킴 return res.status(403).redirect('/') ;
  // if(video.owner !== req.session.userDbResult._id){ // 표기효율성 증진하기 전
  // [ 시큐어 보안 코딩 & Javascript ] 동영상 올린 당사자임에도 조건문 비교값의 형식이 Object 와 String 을로 달라서 if(video.owner !== req.session.userDbResult._id) 조건문이 전혀 실행되지 않는 오류 발생함
  // [ 시큐어 보안 코딩 & Javascript ] 조건문 문법 ===, !== 은 생김새 뿐만 아니라 type (즉, 자료형)도 비교하기 때문
  // [ 시큐어 보안 코딩 & Javascript ] console.log(typeof video.owner, typeof req.session.userDbResult._id); 확인해보니 video.owner 는 Object 형식이고 req.session.userDbResult._id 는 String 형식
  // [ 시큐어 보안 코딩 & Javascript ] 조건문의 양변을 String 타입으로 변환 처리요 if(String(video.owner) !== String(_id)){}
  if (String(video.owner) !== String(_id)) {
    // 표기효율성 증진용
    // if(video.owner !== _id){
    return res.status(403).redirect("/");
  }

  console.log(typeof video.owner, typeof req.session.userDbResult._id);
  console.log("videoController.js ------ getEdit -------", video.owner, _id);

  return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};

// postEdit 함수는 변경사항을 저장해줌
export const postEdit = async (req, res) => {
  const idVideo = req.params.id;

  // [ Express 문법 ] express 스스로는 form의 body(즉, value)를 처리할 줄 모름.
  // [ Express 문법 ] route들을 사용하기 전에 middleware를 사용해야 함
  // [ Express 문법 ] server.js에서 express.urlencoded() 내장함수를 middleware로써 기능하도록 app.use(urlencoded( { extended: true } )); 라고 코딩하여 express에게 form을 처리하고 싶다고 알려주면 Javascript 형식으로 변형시켜줘서 우리가 사용할 수 있게 됨
  const { title, description, hashtags } = req.body;

  const handlePostEdit = {
    title,
    description,

    // [ Javascript 문법 ] startsWith() 메소드는 어떤 문자열이 특정 문자로 시작하는지 확인하여 결과를 true 혹은 false로 반환합니다.
    // [ Javascript 문법 ] ??? startsWith()
    hashtags:
      /*  
                    
                          // hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`)),
                          // [ javascript 문법 ] 미주알고주알 코드넝쿨을 간결화하기 위해 Video.js 에서 샵(#) 달아주기 기능 함수를 named export 하고 videoController.js에서 import하여 사용함
                              formatHashtags(hashtags),
                */
      // [ Mongoose 문법 ] Javascript 문법인 export, import를 활용해 샵(#) 달아주기 코드를 save와 update 컨트롤 함수에서 불러와 사용해도 되지만, 몽구스 내장함수인 videoSchema.static(이름, 함수)를 활용해서 save와 update 작업에서의 샵(#) 달아주기를 처리할 수도 있다
      Video.formatHashtags(hashtags),
  };

  // [ Mongoose 문법 ] Edit 기능 구현을 위해 video 오브젝트(title, description, hashtags, ...) 전체를 받는 대신에 true/false 여부(즉, 영상 존재 여부)만 받아와도 됨 (즉, <db model>.findById() 대신에 <db model>.exists() 사용이 적절)
  // [ Mongoose 문법 ] <db model>.exists(아규먼트 자리인 이곳에 id는 받지 않으며 filter(즉, 조건)만 받음)
  // 오브젝트 id(즉, _id)가 req.params.id와 같은 경우(즉, 조건)를 찾음

  // #8.14 니코쌤 코드 그대로 쓰면 postEdit에서 video.owner이 undefinded가 나옵니다! 이유는 video를 가져올때 Video.exists로 가져오는데 exists메소드는 boolean을 리턴하기때문에 video.owner이 undefinded로 나오는 거예요!
  const video = await Video.findById(idVideo); // 로 바꿔주시면 해결 될 겁니다!
  // 주의! ★★★ postEdit 함수 내에서는 getEdit 함수 내에서 const video = await Video.findById(idVideo) 쿼리문과는 다르게 True 또는 False 를 반환하는 Video.exists 쿼리문을 사용하므로 쿼리 결과값 담는 명칭을 videoTrueFalse 라고 작명함
  // const videoTrueFalse = Video.exists({ _id : idVideo});

  console.log("videoController.js ------ postEdit ------ video", video);

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }

  // [ 시큐어 보안 코딩 ★★★ ] 사용자A 가 올린 동영상이라서 watch.pug(즉, 프론트엔드) 에서 사용자A 에게만 해당 영상 게시물의 edit 페이지 및 기능과 delete 기능(즉, videoController.js 의 getEdit 함수, postEdit 함수, deleteVideo 함수)에 접근할 수 있는 링크(즉, a 태그) 를 보여주는 방식 만으로는 접근 제한 보안성 취약함
  // [ 시큐어 보안 코딩 ★★★ ] 사용자B 가 직접 URL 경로 입력(즉, http://localhost:4000/videos/동영상랜덤파일명/edit)을 통해 사용자A 가 올린 동영상 게시물의 edit 페이지 및 기능과 delete 기능(즉, videoController.js 의 getEdit 함수, postEdit 함수, deleteVideo 함수)에 접근 및 사용할 수 있는 보안취약점이 있음
  // [ 시큐어 보안 코딩 ] video.owner(즉, 영상 게시자)와 req.session.userDbResult._id(즉, 현재 로그인한 사용자)가 동일한 인물인지 검증해서 거짓이라면 Forbidden 상태코드 발생시켜 메인페이지로 강제 이동시킴 return res.status(403).redirect('/') ;
  // if(video.owner !== req.session.userDbResult._id){ // 표기효율성 증진하기 전
  // [ 시큐어 보안 코딩 & Javascript ] 동영상 올린 당사자임에도 조건문 비교값의 형식이 Object 와 String 을로 달라서 if(video.owner !== req.session.userDbResult._id) 조건문이 전혀 실행되지 않는 오류 발생함
  // [ 시큐어 보안 코딩 & Javascript ] 조건문 문법 ===, !== 은 생김새 뿐만 아니라 type (즉, 자료형)도 비교하기 때문
  // [ 시큐어 보안 코딩 & Javascript ] console.log(typeof video.owner, typeof req.session.userDbResult._id); 확인해보니 video.owner 는 Object 형식이고 req.session.userDbResult._id 는 String 형식
  // [ 시큐어 보안 코딩 & Javascript ] 조건문의 양변을 String 타입으로 변환 처리요 if(String(video.owner) !== String(_id)){}
  const {
    userDbResult: { _id },
  } = req.session; // 표기효율성 증진용
  if (String(video.owner) !== String(_id)) {
    // 표기효율성 증진용
    // if(video.owner !== _id){
    return res.status(403).redirect("/");
  }

  // [ Mongoose 문법 ] <db model>.findByIdAndUpdate 내장함수를 이용해 _id값에 해당하는 db데이터에 대해 update 처리함
  // [ Mongoose 문법 ] 주의: .findByIdAndUpdate 기능을 위한 Pre Middleware는 없음 / findByIdAndUpdate는 findOneAndUpdate를 호출함 / findOneAndUpdate를 위한 Middleware는 있음 / findOneAndUpdate는 save hook을 호출하는 기능은 없으며 update 하려는 문서에 접근할 수 없음 /
  await Video.findByIdAndUpdate(idVideo, handlePostEdit);

  console.log(req.body);
  return res.redirect(`/videos/${idVideo}`);

    /* 
    // Dear professor!
    // In the postEdit function, I used res.render('watch', ~) instead of return res.redirect(`/videos/${idVideo}`);
    // I thought it also showed the updated information like when I used res.redirect(), but it didn't.
    // In the video collection, the information was updated successfully. However, the updated information isn't shown at all in the browser when I use res.render() instead of res.redirect(). It only shows the information before being updated.
    // I don't know What I am missing. Please help me~ 
    // hashtags: Video.formatHashtags(hashtags) })
    // ★★★★★★★ 
    // That is because by default findByIdAndUpdate will return the old model.
    // hashtags: Video.formatHashtags(hashtags) }, { new: true })
    // You can do this and it will return the newest updated version:
    const video = await Video.findByIdAndUpdate(id, { 
      title, description, 
      hashtags: Video.formatHashtags(hashtags) }, { new: true })
    res.render('watch', { pageTitle: `Watch: ${video.title}`, video})
    */
};

// [ Express 문법 ] express 스스로는 form의 body를 처리할 줄 모름. express.urlencode() 내장함수를 통해 express에게 form을 처리하고 싶다고 알려줘야 함

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

// [ 클론코딩 허점 보완요 ★★★ ] #8.14 deleteVideo 에서 User 의 videos 에서도 제거해주는 게 나을 듯요? 에러는 안 날 것 같긴 한데
// [ 클론코딩 허점 보완요 ★★★ ] #8.14 음 그러게요 delete 해도 에러는 안나는데 Users DB에 남아있는게 거슬리네요
export const postUpload = async (req, res) => {
  // console.log(req.body);

  const {
    userDbResult: { _id },
  } = req.session;

  // [ Javascript ES6 문법 ] Multer 가 제공해주는 req.file 값에서 file 자체가 아닌 file 의 경로가 필요하므로 req.file.path 에서 path 값을 받은 뒤에 ES6 문법을 활용해 fileUrl 이라고 바꿀 수 있음 const { path: fileUrl } = req.file;
  const { path: fileUrl } = req.file;
  // 혹은 import { path } from 'express/lib/application'; 코드로 임포트(vsc에서 자동기재처리) 한 다음 const { path } = req.file;
  // 혹은 const file = req.file;

  // Pug 코드의 form 태그 내의 input 태그에 name 속성으로 명명해 주어야 POST submit한 값이 key: value 형태로 req.body에서 포착 가능함
  const titleVideoUpload = req.body.titleVideoUploadInput;
  const { description, hashtags } = req.body;

  // document (즉, javascript object)는 데이터를 가진 비디오이며 documnet를 db에 저장해야 함
  // [ Mongoose 문법 ] models/Video.js 코드에 있는 mongoose.Schema() 기반으로 Video.create() 함
  // [ Mongoose 문법 ] .create() 내장함수 사용하면 document(즉, javascript object)를 만들어주는 과정을 우리가 직접 하지 않아도 됨
  // [ Mongoose 문법 ] models/Video.js 코드에서 데이터 형태를 미리 정해둔 덕분에 mongoose가 데이터 타입의 유효성 검사(validation)를 도와주고 있어서 한결 수월한 코딩 환경 상태

  // [ Javascript 문법 ] await에서 error 생기면 내부 코드는 아무것도 실행되지 않으므로 try {} catch {} 문법을 통해 error를 catch 해줘야 함
  try {
    const newVideo = await Video.create({
      // await Video.create({
      // const video = new Video({

      // [ Javascript ES6 문법 ] Multer 가 제공해주는 req.file 값에서 file 자체가 아닌 file 의 경로가 필요하므로 req.file.path 에서 path 값을 받은 뒤에 ES6 문법을 활용해 fileUrl 이라고 바꿀 수 있음 const { path: fileUrl } = req.file;
      // [ Mongoose 문법 ] videoController.js 의 postUpload 함수 내의 Video.create{} 쿼리 코드가 동작하려면 video.js 의 Video 모델의 new mongoose.Schema({}) 스키마 내에 fileUrl: { type: String, required: true } 라고 정의되어 있어야 함
      fileUrl,
      // 혹은 fileUrl: path,
      // 혹은 fileUrl: file.path,

      // [ Mongoose 연계 문법 ] 기능01: (video.js 코드부터 참조요) 영상 재생 페이지에서 비디오 업로더 당사자가 아니면 Edit Video, Delete Video 접근하지 못하도록 버튼 숨김 처리하는 기능
      // 영상 업로드하는 사용자의 _id (즉, userController.js 의 PostJoin 함수 내의 await User.create({}) 쿼리문에 의한 Mongo DB 자체 부여값)를 전송
      // [ Mongoose 연계 문법 ] video.js 의 Video 모델 스키마 지정 부문에서 new mongoose.Schema({ owner: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'User'} }) 라는 내용을 추가하여 owner 에 대해 ObjectId 유형으로 _id 식별할 수 있게 미리 지정해 놓았음
      owner: _id,

      title: titleVideoUpload,

      description,

      // [ Mongoose 문법 ] models/Video.js 에서 db 스키마 설정할 때 createdAt: { type: Date, required: true, default: Date.now }와 같이 default로 Date.now 함수 값 부여하도록 이미 설정했으므로 VideoController.js의 Video.create() 내장함수 내에서 createdAt 값 동작 자체를 처리하지 않아도 됨
      // createdAt: Date.now(),

      // [ Mongoose 문법 ] 미들웨어(Middleware) / pre, post, hook 기능을 통해 object가 db에 저장 및 업데이트 하기 전 또는 후 시점에 사용자의 입력값에 대한 사전처리를 하거나 체크를 해야하는 경우가 있음

      // ??? 질문- 사용자가 쉼표 다음에 빈 칸 넣어서 입력했다면 어떻게 빈 칸 자동 제거?
      // Video.js 파일의 db schema 설정 코드에서 hashtags 속성을 string 타입의 array로 지정했었음 (즉, hashtags: [{ type: String, trim: true }])
      // [ Javascript 문법 ] .split(), .map() 내장함수 체이닝 하지 않은 hashtags에는 사용자가 쉼표(,)로 구분해 입력한 값들이 ['a,b,c']와 같은 array[0] 값(1 string element)으로만 처리됨
      hashtags:
        /*  
                    
                          // hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`)),
                          // [ javascript 문법 ] 미주알고주알 코드넝쿨을 간결화하기 위해 Video.js 에서 샵(#) 달아주기 기능 함수를 named export 하고 videoController.js에서 import하여 사용함
                              formatHashtags(hashtags),
                */
        // [ Mongoose 문법 ] Javascript 문법인 export, import를 활용해 샵(#) 달아주기 코드를 save와 update 컨트롤 함수에서 불러와 사용해도 되지만, 몽구스 내장함수인 videoSchema.static(이름, 함수)를 활용해서 save와 update 작업에서의 샵(#) 달아주기를 처리할 수도 있다
        Video.formatHashtags(hashtags),
    });

    // [ Mongoose 연계 문법 ] Relationship 작업B - 2차버전간결코드 <즉, Mongoose 의 .populate('videos') 곁들인> ) 1차버전장황코드 DB 초기화 선행요 / 사용자가 업로드한 모든 video 목록 보여주기: User 모델에 video list(즉, 여러 개의 video 목록) 양단 연결하는 array 형식의 스키마 추가요
    // [ Mongo DB & Mongoose 연계 문법 ★★★] 이처럼 Video 모델과 User 모델을 연결하는 스키마와 controller 를 만들려면 우선적으로 mongo 콘솔 명령어 db.users.remove({}) 와 db.videos.remove({}) 를 실행해 두 개의 collection (즉, users 와 videos) 를 모두 삭제(즉, 초기화) 해야 함
    // [ Mongoose 연계 문법 ] 1개의 영상에 대한 소유주가 1명이지만 소유주는 여러 영상을 소유할 수 있으므로 array 형태로 스키마 추가함
    // [ Mongoose 연계 문법 ] 새로 업로드 하는 영상의 _id 값(즉, Video 모델 기반의 const newVideo = await Video.create({}) 쿼리 결과로 Mongo DB 가 자체 부여하는 영상별 _id 값) 을 User 모델의 videos 에 array 형태로 저장해야 함
    const user = await User.findById(_id);

    // [ Javascript 문법 ] array 에 요소를 추가하려면 push 문법 활용요
    user.videos.push(newVideo._id);

    // [ Javascript 문법 ] DB 에 데이터를 저장하는 데는 시간이 걸리므로 async 함수 내에 await 명시요
    // [ Mongoose 문법 ] .save()는 promise를 return 해줌. (즉, save 되는 순간 db에 기록되고 저장되려면 시간이 걸리므로 작업이 끝날 때까지 기다려줘야 함)
    // [ Mongoose 문법 ] join.pug의 input 태그에서 submit한 내용이 User.create() 함수에 의해 처리되기 전에 .pre('save', function(){}) 미들웨어 코드로 비밀번호 hash 상태로 변환시킴
    // [ Mongoose 문법 ] 주의: 미들웨어(Middleware) 코드는 model 코드 이전에 작성되어야 함
    // [ Mongoose 문법 ] 미들웨어(Middleware) / pre, post, hook 기능을 통해 object가 db에 저장 및 업데이트 하기 전 또는 후 시점에 사용자의 입력값에 대한 사전처리를 하거나 체크를 해야하는 경우가 있음
    // [ Mongoose 문법 ] 미들웨어(Middleware) / pre, post, hook 코드 내에서 this는 저장하려는 문서를 가리킴
    // 저장(save) 되기 전에(pre) Middleware(userSchema)로 호출될 async function

    // [ Mongoose 문법 & 버그 수정 ★★★ ] videoController.js 의 postUpload 함수 내에서 새로운 비디오 업로드 할 때마다 user.save(); 코드 실행해야 하는데 마침 그 전 단계에 pre 기능으로 비밀번호를 hash 하도록 하는 코드가 반복적으로 가동되어 사용자의 원비밀번호를 계속 변경시키는 코드 버그 발생함 User.js 의 userSchema.pre('save', async function(){this.password = await bcrypt.hash(this.password, 5);}
    // [ Mongoose 문법 & 버그 수정 ★★★ ] User.js 의 userSchema.pre('save', async function(){} 함수 내에서 if(this.isModified('password')){ 패스워드 해싱해주는 코드 } 조건문을 통해 사용자 password 값이 변경될 때만 password 값을 hash 하도록 경우를 구분해 처리시킴
    user.save();

    // [ Mongoose 문법 ] .save()는 promise를 return 해줌. (즉, save 되는 순간 db에 기록되고 저장되려면 시간이 걸리므로 작업이 끝날 때까지 기다려줘야 함)
    // document(즉, javascript object)를 db에 저장
    // await video.save();

    // video 생성에 문제가 없다면 home으로 페이지가 redirect 됨
    return res.redirect("/");
  } catch (error) {
    console.log(error);

    // [ Javascript 문법 ] try {} catch {} 문법으로 error를 잡아내더라도 무언가를 return 해야함 (즉, upload를 다시 render함 = getUpload 컨트롤러의 return 코드를 복붙했음)
    // 사용자에게 에러 메세지를 직접 보여주기 위해 upload.pug 템플릿으로 에러 메세지를 object key:value 형태로 담아서 넘겨줌 (에러를 try {} catch {console.log(error)} 해보면 _message: 'Video validation failed'와 같은 형태로 에러값이 표시됨)

    // 400 Bad Request 클라이언트 오류(예: 잘못된 요청 구문, 유효하지 않은 요청 메시지 프레이밍, 또는 변조된 요청 라우팅)
    // [ Express 문법 ] try { await Video.create() } catch(error) { return res.render() }  라고만 처리하면 사용자에게는 오류 맥락을 이해시켰지만 브라우저는 상태 응답 코드 200을 받은 상태로 남게 됨. 브라우저도 오류 상황으로 처리할 수 있도록 .status() 문법으로 상태 코드를 명시해야 함. 그러면 morgan 미들웨어(즉, app.use(logger);) 통해 서버 로그 상에 400 이라고 표시됨
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

/*
//////////////////////////////////////////////////////////////////
//// 221006 yd 자체 보완(Not mongoose)(현재 주석처리) ////////////
/////////////////////////////////////////////////////////////////
// [ 클론코딩 허점 보완요 ★★★ ] #8.14 deleteVideo 에서 User 의 videos 에서도 제거해주는 게 나을 듯요? 에러는 안 날 것 같긴 한데
// [ 클론코딩 허점 보완요 ★★★ ] #8.14 음 그러게요 delete 해도 에러는 안나는데 Users DB에 남아있는게 거슬리네요
export const deleteVideoElementFromUser = async(req, res, next) => {
  const { id } = req.params;
  
  const video = await Video.findById(id)

  const user = await User.findById(video.owner)

  let videosArr = user.myUploadedVideos;
  console.log('user.myUploadedVideos ------------', user.myUploadedVideos)
  
  console.log('videoArr ------- BEFORE ---------', videosArr)

  for(let i = 0; i < videosArr.length; i++){ 
    if ((videosArr[i]).toString() === (video._id).toString()) { 
      videosArr.splice(i, 1); 
      i--; 
    }
  }

  console.log('videoArr ------- AFTER ---------', videosArr)

  await User.findByIdAndUpdate(user._id, { myUploadedVideos: videosArr})

  next()
}
*/


// [ 클론코딩 허점 보완요 ★★★ ] #8.14 deleteVideo 에서 User 의 videos 에서도 제거해주는 게 나을 듯요? 에러는 안 날 것 같긴 한데
// [ 클론코딩 허점 보완요 ★★★ ] #8.14 음 그러게요 delete 해도 에러는 안나는데 Users DB에 남아있는게 거슬리네요
export const deleteVideo = async (req, res) => {
  const idVideo = req.params.id;

  const video = await Video.findById(idVideo);

  if (!video) {
    // 404 Not Found 클라이언트 오류(서버가 요청받은 리소스를 찾을 수 없다)
    // [ Express 문법 ] return res.render('404', { pageTitle: 'Video not found.'}); 라고만 처리하면 사용자에게는 오류 맥락을 이해시켰지만 브라우저는 상태 응답 코드 200을 받은 상태로 남게 됨. 브라우저도 오류 상황으로 처리할 수 있도록 .status() 문법으로 상태 코드를 명시해야 함. 그러면 morgan 미들웨어(즉, app.use(logger);) 통해 서버 로그 상에 404 이라고 표시됨
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }

  // [ 시큐어 보안 코딩 ★★★ ] 사용자A 가 올린 동영상이라서 watch.pug(즉, 프론트엔드) 에서 사용자A 에게만 해당 영상 게시물의 edit 페이지 및 기능과 delete 기능(즉, videoController.js 의 getEdit 함수, postEdit 함수, deleteVideo 함수)에 접근할 수 있는 링크(즉, a 태그) 를 보여주는 방식 만으로는 접근 제한 보안성 취약함
  // [ 시큐어 보안 코딩 ★★★ ] 사용자B 가 직접 URL 경로 입력(즉, http://localhost:4000/videos/동영상랜덤파일명/edit)을 통해 사용자A 가 올린 동영상 게시물의 edit 페이지 및 기능과 delete 기능(즉, videoController.js 의 getEdit 함수, postEdit 함수, deleteVideo 함수)에 접근 및 사용할 수 있는 보안취약점이 있음
  // [ 시큐어 보안 코딩 ] video.owner(즉, 영상 게시자)와 req.session.userDbResult._id(즉, 현재 로그인한 사용자)가 동일한 인물인지 검증해서 거짓이라면 Forbidden 상태코드 발생시켜 메인페이지로 강제 이동시킴 return res.status(403).redirect('/') ;
  // if(video.owner !== req.session.userDbResult._id){ // 표기효율성 증진하기 전
  // [ 시큐어 보안 코딩 & Javascript ] 동영상 올린 당사자임에도 조건문 비교값의 형식이 Object 와 String 을로 달라서 if(video.owner !== req.session.userDbResult._id) 조건문이 전혀 실행되지 않는 오류 발생함
  // [ 시큐어 보안 코딩 & Javascript ] 조건문 문법 ===, !== 은 생김새 뿐만 아니라 type (즉, 자료형)도 비교하기 때문
  // [ 시큐어 보안 코딩 & Javascript ] console.log(typeof video.owner, typeof req.session.userDbResult._id); 확인해보니 video.owner 는 Object 형식이고 req.session.userDbResult._id 는 String 형식
  // [ 시큐어 보안 코딩 & Javascript ] 조건문의 양변을 String 타입으로 변환 처리요 if(String(video.owner) !== String(_id)){}
  console.log(
    "videoController.js ----- deleteVideo ---- video.owner / req.session.userDbResult._id -------",
    video.owner,
    req.session.userDbResult._id
  );
  const {
    userDbResult: { _id },
  } = req.session; // 표기효율성 증진용
  if (String(video.owner) !== String(_id)) {
    // 표기효율성 증진용
    // if(video.owner !== _id){
    return res.status(403).redirect("/");
  }

  // [ Mongoose 문법 ] findByIdAndDelete(id) 내장함수는 findOneAndDelete({_id:id}) 함수의 간략화 버전
  // [ Mongoose 문법 ] findByIdAndDelete(), findOneAndDelete() 사용 권장 (즉, findByIdAndRemove, findOneAndRemove() 사용 비권장)
  // [ Mongoose 문법 ] findByIdAndDelete() 사용하려는 경우에는 const videoOwner = await Video.findByIdAndDelete(video._id);
  // [ Mongoose 문법 ] findOneAndDelete() 사용하려는경우에는 const videoOwner = await Video.findOneAndDelete({_id: video._id});
  const videoOwner = await Video.findByIdAndDelete(video._id);
  console.log(
    "videoController.js ----- deleteVideo ---- idVideo / video._id ----------",
    typeof idVideo,
    idVideo,
    typeof video._id,
    video._id
  );
  console.log("videoController.js ----- videoOwner -----", videoOwner);

  // [ 클론코딩 허점 보완 해냄 ★★★ ] #8.14 deleteVideo 에서 User 의 videos 에서도 제거해주는 게 나을 듯요? 에러는 안 날 것 같긴 한데
  // [ 클론코딩 허점 보완 해냄 ★★★ ] #8.14 음 그러게요 delete 해도 에러는 안나는데 Users DB에 남아있는게 거슬리네요
  const DeletedVideoOwnerUserDb = await User.findById(String(videoOwner.owner));
  console.log("DeletedVideoOwnerUserDb-------------", DeletedVideoOwnerUserDb);

  // const positionIndex = DeletedVideoOwnerUserDb.videos.indexOf(videoOwner._id);
  const positionIndex = DeletedVideoOwnerUserDb.videos.indexOf(video._id);
  console.log("positionIndex-------------", positionIndex);

  const videoToBeDeletedInVideos = DeletedVideoOwnerUserDb.videos.splice(
    positionIndex,
    1
  );
  console.log(
    "videoToBeDeletedInVideos -------------",
    videoToBeDeletedInVideos
  );

  DeletedVideoOwnerUserDb.save();

  // [ Mongoose 문법 ] 구글 키워드 delete element in array mongoose
  // [ Mongoose 문법 ] Unable to delete element from array of objects using mongoose
  // [ Mongoose 문법 ] https://getridbug.com/node-js/unable-to-delete-element-from-array-of-objects-using-mongoose/

  await User.findByIdAndUpdate(
    { _id: DeletedVideoOwnerUserDb._id },
    {
      $pull: {
        videos: { _id: video._id },
      },
    }
  );

  return res.redirect("/");
};
