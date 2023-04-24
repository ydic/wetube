// [ WebPack 문법 ] 즉, 여러 다른 파일들을 WebPack 으로 포함시키는 방법에 해당함
// [ WebPack 문법 ] commentSection.js 코드를 WebPack 에서 인식할 수 있도록 webpack.config.js 내에 entry { commentSection: BASE_JS + "commentSection.js", } 코드 기재함

// [ Express 문법 ] 오류 내용 - Uncaught TypeError: Cannot read properties of null (reading 'querySelector')
// [ Express 문법 ] 오류 원인 - watch.pug 단에서 if loggedin 조건문 값이 false 인 경우(즉, 비로그인 상태) ID속성인 #commentForm 속성이 브라우저단에 나타나지 않도록 설정한 상황에서 commentSection.js 에서 .querySelector('#commentForm'); 동작하여 오류 발생
const form = document.querySelector('#commentForm');

const videoContainer = document.querySelector('#videoContainer');

const handleSubmit = (event) => {
	// [ Javascript 문법 ] event.preventDefault(); 통해 브라우저의 default behavior 기본동작(예- 새로고침 / a태그 href(즉, 하이퍼링크))을 중단시킴
	event.preventDefault();

	//- [ Pug & Javascript 문법 ] if loggedIn 조건문 통해 로그인 상태에서만 watch.pug 단의 댓글 작성용 form 이 화면에 표시되도록 설정함
	//- [ Javascript 문법 ] 비로그인 상태면 if loggedIn 조건문 충족되지 않는 상황에서 script(src="/static/js/commentSection.js") 통해 Pug 단의 댓글 작성용 form 에 대해 DOM 기반으로 처리하려다 보니 오류 메시지 발생함
	// [ Javascript 문법 ] Uncaught TypeError: Cannot read properties of null (reading 'querySelector')
	//- [ Javascript 문법 ] 로그인 여부를 기준으로 form 에 대해 Pug 단과 Javascript 단에서 동작 처리를 달리할 수 있도록 코드 구성
	// [ form 취급 방안B STEP.01 ] DOM 기반해 Pug 단의 form 에 입력된 값을 받아오는 코드를 handleSubmit 함수 내부에 위치시키면, 비로그인 상태여서 form 태그가 표시되지 않더라도 오류 더 이상 발생하지 않음
	//- [ form 취급 방안B ] 를 채택함 / [ form 취급 방안A ] 을 미채택함
	const textarea = form.querySelector('textarea');

	console.log('commentSection.js --- textarea.value ---', textarea.value);

	const text = textarea.value;

	// [ HTML 문법 ] 댓글을 달려고 하는 영상의 식별값을 얻기 위해 watch.pug 단에서 data-videoid 속성값 읽어오기 (즉, div#videoContainer(data-videoid=video._id)
	const videoId = videoContainer.dataset.videoid;
	
	console.log('commentSection.js --- videoContainer.dataset.videoid --- ', videoContainer.dataset.videoid);

	// [ Javascript 문법 ] if(text === ''){ return; } 조건문 통해, submit 버튼 클릭해도 	textarea 에 입력된 값이 없는 경우라면 fetch() 코드 동작하지 않도록 사전 차단함
	if(text === ''){
		return;
	}

	// [ Web API 문법 ] req.body 에 사용자 입력값이 담기도록 만드는 방법에는 form 활용한 코드와 fetch() 활용한 코드가 있음
	// [ Web API 문법 ] handleSubmit() 함수에서는 form 사용하지 않고 fetch() 기법 통해서 Javascript 단에서 POST Request 생성시킴
	// [ Web API & Express 문법 ] form 기반은 app.use(express.urlencoded({ extended: true })); 미들웨어 코드와 연계
	// [ Web API & Express 문법 ] fetch() 기반은 한 개의 내용물이라면 app.use(express.text()); / 복수 개의 내용물이라면 app.use(express.json()); 미들웨어 코드와 연계
	fetch(`/api/videos/${videoId}/comment`, {
		method: 'POST',

		// [ Express 문법 ] headers: { 'Content-Type': 'application/json', } 명시하여 fetch() 통한 POST 요청 데이터의 자료형이 JSON 형식이라는 것을 server.js 의 app.use(express.json()); 미들웨어 코드에게 알려줘야만 req.body 에서 사용자 입력값이 조회 가능함
		// [ Express 문법 ] fetch() 통한 POST 요청하려는 데이터를 JSON.stringify() 통해 string 자료형으로 변환한 상태여서 Express 에서 JSON 자료형이 아닌 텍스트 자료형으로 인식하기에 req.body 에서 조회 불가하므로, headers: { 'Content-Type': 'application/json', } 명시하여 이 문제를 해결
		headers: {
			'Content-Type': 'application/json',
		},

					// body: text, // 한 개의 내용물이라면 app.use(express.text()); 미들웨어와 연계
		// [ Express & Javascript 문법 ] fetch() 통해 서버 통신하려면 JSON.stringify() 통해 데이터가 JSON 자료형으로 변환되어야 하고, JSON.parse() 통해 본래 자료형으로 재변환 되어야 함 (*주의 - app.use(express.json()); 미들웨어 통해 JSON.parse() 기능 대체 가능)
		// [ Express & Javascript 문법 ] ★★★ JSON 자료형은 Object 또는 Array 자료형에 따옴표를 친 형태라서 문자취급 받음
		// [ Express & Javascript 문법 ] JSON.parse() 함수로 따옴표를 제거시키면 브라우저단에서 데이터 인식 가능함 (*주의 - app.use(express.json()); 미들웨어 통해 JSON.parse() 기능 대체 가능)
		// [ Express 문법 ] fetch() 통한 POST 요청하려는 데이터를 JSON.stringify() 통해 string 자료형으로 변환한 상태여서 Express 에서 JSON 자료형이 아닌 텍스트 자료형으로 인식하기에 req.body 에서 조회 불가하므로, headers: { 'Content-Type': 'application/json', } 명시하여 이 문제를 해결
		body: JSON.stringify(
			{ text }
		)
	});

	

}

// [ Javascript 문법 ] form 의 submit 이벤트(즉, click 이벤트가 아니라) 를 감지해야 form 을 submit 했을 때 제출한 내용이 서버단에서 감지 가능함
//- [ Pug & Javascript 문법 ] if loggedIn 조건문 통해 로그인 상태에서만 watch.pug 단의 댓글 작성용 form 이 화면에 표시되도록 설정함
//- [ Javascript 문법 ] 비로그인 상태면 if loggedIn 조건문 충족되지 않는 상황에서 script(src="/static/js/commentSection.js") 통해 Pug 단의 댓글 작성용 form 에 대해 DOM 기반으로 처리하려다 보니 오류 메시지 발생함
//- [ Javascript 문법 ] Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')	
//- [ Javascript 문법 ] 로그인 여부를 기준으로 form 에 대해 Pug 단과 Javascript 단에서 동작 처리를 달리할 수 있도록 코드 구성			
// [ form 취급 방안B STEP.02 ] 사용자가 로그인한 상태여서 Pug 단에 form 표시되는 경우, if(form) 조건문 통해 DOM 기반해 form 감지하도록 설정하면, 'submit' 이벤트를 감지할 대상 요소를 찾을 수 없다는 오류는 더 이상 발생하지 않음
//- [ form 취급 방안B ] 를 채택함 / [ form 취급 방안A ] 을 미채택함
			// form.addEventListener('submit', handleSubmit)
if(form) {
	form.addEventListener('submit', handleSubmit)
}
