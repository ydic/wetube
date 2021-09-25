// 
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

      // [ Mongoose 문법 ] await 표시한 .find() 내장함수는 callback을 필요로 하지 않는다는 것을 알고, 찾아낸 비디오를 바로 출력함. await가 db로부터 결과값을 받을 때까지 기다려 줌. (주의: error 처리는 try {} catch {} 문으로 보완)
      try {
        const videos = await Video.find({})
        // console.log(videos)

        return res.render("home", {pageTitle: 'Home', realArrayVideos: videos})
      } catch {
        return res.render('server-error', {error});
      }
};

export const search = (req, res) => res.send('search video ctrl')

// pug js 맞물림 재확인요: const see? render watch? 이름 통일요?
// videoRouter.js 파일에서 import하여 사용함


// [express 문법] URL 안에 변수를 넣도록 해주는 파라미터(예- :id) 
// [express 문법] 파라미터(예- :id) 덕분에 모든 video마다 videoRouter를 새로 만들 필요 없어짐
// 예시: videoRouter.get('/1', see1); videoRouter.get('/2', see2);
export const watch = async (req, res) => {
  const idVideo = req.params.id;
  
  // [ Mongoose 문법 ] <db model>.findById 내장함수를 통해 id로 데이터(즉, 영상)을 찾아낼 수 있음
  // [ Javascript 문법 ] async await 문법을 적용하여 .findById 내장함수가 데이터를 찾아주는 시간을 기다리도록 함
  const video = await Video.findById(idVideo);
  console.log('watch video---------------',video);

  // [ 질문 ] ??? res 응답할 때 return 붙이고 안붙이고 실행결과 차이? 어떤 것이 옳은 문법? 왜?

  return res.render('watch', { pageTitle: video.title, video});  
}

// getEdit 함수는 브라우저에 form을 보여줌
export const getEdit = (req, res) => {
  const idVideo = req.params.id;
  
  return res.render('edit', { pageTitle: `Editing`, video});
};

// postEdit 함수는 변경사항을 저장해줌
export const postEdit = (req, res) => {
  const idVideo = req.params.id;
  
  // [ Express 문법 ] express 스스로는 form의 body(즉, value)를 처리할 줄 모름. 
  // [ Express 문법 ] route들을 사용하기 전에 middleware를 사용해야 함
  // [ Express 문법 ] server.js에서 express.urlencoded() 내장함수를 middleware로써 기능하도록 app.use(urlencoded( { extended: true } )); 라고 코딩하여 express에게 form을 처리하고 싶다고 알려주면 Javascript 형식으로 변형시켜줘서 우리가 사용할 수 있게 됨
  const titleVideo = req.body.titleVideoInput;
  
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

      // ??? 질문- 사용자가 쉼표 다음에 빈 칸 넣어서 입력했다면 어떻게 빈 칸 자동 제거?
      hashtags: hashtags.split(',').map(word => `#${word}`),

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