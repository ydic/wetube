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
        console.log(videos)

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
export const watch = (req, res) => {

  // [ 질문 ] ??? res 응답할 때 return 붙이고 안붙이고 실행결과 차이? 어떤 것이 옳은 문법? 왜?

  return res.render('watch', { pageTitle: `Watching`});  
}

// getEdit 함수는 브라우저에 form을 보여줌
export const getEdit = (req, res) => {
  const idVideo = req.params.id;

  return res.render('edit', { pageTitle: `Editing`});
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

export const postUpload = (req, res) => {
  // here we will add a video to the videos array
  console.log(req.body);

  // Pug 코드의 form 태그 내의 input 태그에 name 속성으로 명명해 주어야 POST submit한 값이 key: value 형태로 req.body에서 포착 가능함
  const titleVideoUpload = req.body.titleVideoUploadInput;

  return res.redirect('/');
}

