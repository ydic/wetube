/*
    // [ Mongoose 문법 ] Javascript 문법인 export, import를 활용해 샵(#) 달아주기 코드를 save와 update 컨트롤 함수에서 불러와 사용해도 되지만, 몽구스 내장함수인 videoSchema.static(이름, 함수)를 활용해서 save와 update 작업에서의 샵(#) 달아주기를 처리할 수도 있다
    import Video, { formatHashtags } from '../models/video';
*/  

// Video.js에서 export default Video; 한 것을 import 함
import Video from '../models/video'; 


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
        const videos = await Video.find({}).sort({ createdAt: 'desc'});
        // console.log(videos)

        return res.render("home", {pageTitle: 'Home', realArrayVideos: videos})
      } catch {
        return res.render('server-error', {error});
      }
};

export const search = async (req, res) => {
  // [ Express 문법 ] req.query 내장함수를 통해 input 태그에서 입력한 검색 키워드(GET 요청)를 받아올 수 있음
  
  const { keyword } = req.query;

  // search.pug 페이지의 keyword 초기값은 사용자 검색키워드 submit 이전이므로 undefined 상태임
  // keyword가 undefined 상태가 아니라면 해당 값으로 검색 작업 시행해서 searchResults 배열에 담기도록 함
  let searchResults = [];
  if(keyword) {
    searchResults = await Video.find({
      title: {
        // [ 정규표현식 문법 MongoDB ] $regex는 MongoDB가 제공하는 여러 operator 중에 한 가지임 / 예- { <field> : { $regex: 정규표현 관련 설정(문서 재참고요) } }
        // [ 정규표현식 문법 Javascript ] new RegExp(PATTERN, FLAGS)
        // [ 정규표현식 문법 Javascript ] i는 ignore case이며 영문 대소문자 구분하지 않는 속성임
        $regex: new RegExp(keyword,'i')
      }
    });
  }
  return res.render('search', { pageTitle: 'Search', searchResults});
}


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
  
  const video = await Video.findById(idVideo)

  // 에러 나는 경우를 먼저 if로 처리해주고 else에는 정상적인 케이스에 작동할 코드를 담으면 됨
  // 사용자가 존재하지 않는 페이지를 검색할 경우도 대비해 return res.render(PUG 파일 (즉,404 관련)) 적절한 응답처리 페이지 만들어놓아야 함
  if(video === null) {
        // if(!video) {
    
    // ??? [ 주의 ] videoRouter.js의 정규표현식 /:id[0-9a-f]{24} 덕분에 몽고DB? 몽구스? ObjectID 24자리값을 인식하고 다룰 수 있게 됐지만, 글자수 24자이면서 오타(존재하지 않는 ID)는 videoRouter에서 404.pug로까지 데이터 넘어오지만, 글자수 24자 아닌(23이하, 25 이상) 오타값에 대한 페이지 검색시에는 여전히 cannot GET 응답 없는 페이지 나옴. 이 부분도 별도 처리 필요.
    // [ Javascript 문법 ] function을 끝내야 하므로 if문 안에 return 표기를 반드시 명시해야 함
    return res.render('404', { pageTitle: 'Video not found.'});  

  } else {
    // [ 질문 ] ??? res 응답할 때 return 붙이고 안붙이고 실행결과 차이? 어떤 것이 옳은 문법? 왜?

    // 존재하지 않아 유효하지 않은 id(24바이트 16진수) 값으로 접속 시도하면 영상 검색에 실패했으므로 "비디오는 null이고 null은 title을 갖고 있지 않습니다" --- TypeError: Cannot read property 'title' of null
    return res.render('watch', { pageTitle: video.title, video});  
  }
}

// getEdit 함수는 브라우저에 form을 보여줌
export const getEdit = async (req, res) => {
  const idVideo = req.params.id;
  
  // 대문자 Video는 Video.js에서 Schema 정의한 Mongoose Model임
  // 소문자 video는 db에서 검색한 영상 object임(title, description, hashtags, ...)
  
  const video = await Video.findById(idVideo)

  if(!video) {
    return res.render('404', { pageTitle: 'Video not found.'})
  } else {
    return res.render('edit', { pageTitle: `Editing: ${video.title}`, video});
  }
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
    }

  // [ Mongoose 문법 ] Edit 기능 구현을 위해 video 오브젝트(title, description, hashtags, ...) 전체를 받는 대신에 true/false 여부(즉, 영상 존재 여부)만 받아와도 됨 (즉, <db model>.findById() 대신에 <db model>.exists() 사용이 적절)
  // [ Mongoose 문법 ] <db model>.exists(아규먼트 자리인 이곳에 id는 받지 않으며 filter(즉, 조건)만 받음)
  // 오브젝트 id(즉, _id)가 req.params.id와 같은 경우(즉, 조건)를 찾음
  const videoTrueFalse = Video.exists({ _id : idVideo});

  if(!videoTrueFalse) {
    return res.render('404', { pageTitle: 'Video not found.'})
  }

  // [ Mongoose 문법 ] <db model>.findByIdAndUpdate 내장함수를 이용해 _id값에 해당하는 db데이터에 대해 update 처리함
  // [ Mongoose 문법 ] 주의: .findByIdAndUpdate 기능을 위한 Pre Middleware는 없음 / findByIdAndUpdate는 findOneAndUpdate를 호출함 / findOneAndUpdate를 위한 Middleware는 있음 / findOneAndUpdate는 save hook을 호출하는 기능은 없으며 update 하려는 문서에 접근할 수 없음 / 
  await Video.findByIdAndUpdate(idVideo, handlePostEdit);

  console.log(req.body);
  return res.redirect(`/videos/${idVideo}`);
};

// [ Express 문법 ] express 스스로는 form의 body를 처리할 줄 모름. express.urlencode() 내장함수를 통해 express에게 form을 처리하고 싶다고 알려줘야 함

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가

export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: "Upload Video"})
}

export const postUpload = async (req, res) => {
  // console.log(req.body);

  // Pug 코드의 form 태그 내의 input 태그에 name 속성으로 명명해 주어야 POST submit한 값이 key: value 형태로 req.body에서 포착 가능함
  const titleVideoUpload = req.body.titleVideoUploadInput;
  const { description, hashtags } = req.body;

  // document (즉, javascript object)는 데이터를 가진 비디오이며 documnet를 db에 저장해야 함
  // [ Mongoose 문법 ] models/Video.js 코드에 있는 mongoose.Schema() 기반으로 Video.create() 함
  // [ Mongoose 문법 ] .create() 내장함수 사용하면 document(즉, javascript object)를 만들어주는 과정을 우리가 직접 하지 않아도 됨
  // [ Mongoose 문법 ] models/Video.js 코드에서 데이터 형태를 미리 정해둔 덕분에 mongoose가 데이터 타입의 유효성 검사(validation)를 도와주고 있어서 한결 수월한 코딩 환경 상태
  
  // [ Javascript 문법 ] await에서 error 생기면 내부 코드는 아무것도 실행되지 않으므로 try {} catch {} 문법을 통해 error를 catch 해줘야 함
  try {
    await Video.create({
          // const video = new Video({
      
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
      })

      // [ Mongoose 문법 ] .save()는 promise를 return 해줌. (즉, save 되는 순간 db에 기록되고 저장되려면 시간이 걸리므로 작업이 끝날 때까지 기다려줘야 함)
      // document(즉, javascript object)를 db에 저장
            // await video.save();

      // video 생성에 문제가 없다면 home으로 페이지가 redirect 됨
      return res.redirect('/');
  } catch(error) {
    
    console.log(error);    
    
    // [ Javascript 문법 ] try {} catch {} 문법으로 error를 잡아내더라도 무언가를 return 해야함 (즉, upload를 다시 render함 = getUpload 컨트롤러의 return 코드를 복붙했음)
    // 사용자에게 에러 메세지를 직접 보여주기 위해 upload.pug 템플릿으로 에러 메세지를 object key:value 형태로 담아서 넘겨줌 (에러를 try {} catch {console.log(error)} 해보면 _message: 'Video validation failed'와 같은 형태로 에러값이 표시됨)

    return res.render('upload', { pageTitle: "Upload Video", errorMessage: error._message},)
  }
}

export const deleteVideo = async (req, res) => {
  const idVideo = req.params.id;

  // [ Mongoose 문법 ] findByIdAndDelete(id) 내장함수는 findOneAndDelete({_id:id}) 함수의 간략화 버전
  // [ Mongoose 문법 ] findByIdAndDelete(), findOneAndDelete() 사용 권장 (즉, findByIdAndRemove, findOneAndRemove() 사용 비권장)
  await Video.findOneAndDelete(idVideo);

  return res.redirect('/');
}