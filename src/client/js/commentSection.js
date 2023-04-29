// [ WebPack 문법 ] 즉, 여러 다른 파일들을 WebPack 으로 포함시키는 방법에 해당함
// [ WebPack 문법 ] commentSection.js 코드를 WebPack 에서 인식할 수 있도록 webpack.config.js 내에 entry { commentSection: BASE_JS + "commentSection.js", } 코드 기재함

// [ Express 문법 ] 오류 내용 - Uncaught TypeError: Cannot read properties of null (reading 'querySelector')
// [ Express 문법 ] 오류 원인 - watch.pug 단에서 if loggedin 조건문 값이 false 인 경우(즉, 비로그인 상태) ID속성인 #commentForm 속성이 브라우저단에 나타나지 않도록 설정한 상황에서 commentSection.js 에서 .querySelector('#commentForm'); 동작하여 오류 발생
const form = document.querySelector('#commentForm');

const videoContainer = document.querySelector('#videoContainer');

// [ Javascript 문법 ] document.querySelectorAll() 통해 사용자 본인이 작성한 모든 댓글들에 대한 삭제 버튼들이 NodeList 자료형 배열에 배열의 요소로 담김
const commentDeleteBtn = document.querySelectorAll('.video__comment-deleteBtn');
console.log('commentSection.js --- 기본 상태에서 commentDeleteBtn 조회시--- ', commentDeleteBtn);

const RequestDeleteComment = async (event) => {

	console.log('commentSection.js --- RequestDeleteComment 함수 내에서의 commentDeleteBtn 조회시--- ', commentDeleteBtn);
	console.log('commentSection.js --- commentDeleteBtn --- 삭제버튼누름 --- event.target.parentElement', event.target.parentElement);

	// [ Javascript 문법 ] 자바스크립트 상에서 videoContainer.dataset.videoid; 코드 통해 watch.pug 내의 div#videoContainer(data-videoid=video._id) 속성을 읽어와	해당 영상ID 값을 DELETE 요청하는 라우트 코드(즉, apiRouter.js 의 apiRouter.delete() 코드) 에 활용함
	const videoId = videoContainer.dataset.videoid;

	// [ Javascript 문법 ] event.target.parentElement.dataset; 통해 삭제 버튼의 부모 요소 태그(즉, li.video__comment(data-id=comment._id) 코드)를 프론트엔드단에서의 삭제 대상으로 특정함
	const commentIdToDelete = event.target.parentElement.dataset;
	
	const response = await fetch(`/api/videos/${videoId}/comment`, {
		method: 'DELETE',

		// [ Express 문법 ] headers: { 'Content-Type': 'application/json', } 명시하여 fetch() 통한 DELETE 요청 데이터의 자료형이 JSON 형식이라는 것을 server.js 의 app.use(express.json()); 미들웨어 코드에게 알려줘야만 프론트엔드단에서 보내는 fetch( , { body: JSON.stringify(값)}) 값이 서버단의 req.body 에서 조회 가능함
		headers: {
			'Content-Type': 'application/json',
		},

		// [ Express 문법 ] fetch() 통한 POST 요청하려는 데이터를 JSON.stringify() 통해 string 자료형으로 변환한 상태여서 Express 에서 JSON 자료형이 아닌 텍스트 자료형으로 인식하기에 req.body 에서 조회 불가하므로, headers: { 'Content-Type': 'application/json', } 명시하여 이 문제를 해결
		body: JSON.stringify(commentIdToDelete),
	});
	
	console.log('commentSections.js --- response.status --- ', response.status);
	
	// [ Express & Javascript 문법 ] videoController.js 의 deleteComment 함수 속 await Comment.findByIdAndDelete(id); 통해 댓글 삭제 성공시 서버단에서 return res.sendStatus(200); 상태코드를 보내줌
	// [ Express & Javascript 문법 ] 프론트엔드단에서 상태코드 200 확인되면, 클릭 이벤트 발생한 요소의 부모 요소.remove(); 통해 페이크 댓글을 브라우저에 표시되지 않도록 지움
	if(response.status == 200) {

		const element = event.target.parentElement;
	
		console.log('commentSection.js --- if(response.status === 202) --- event.target.parentElement; ---', event.target.parentElement);
		
		element.remove();
	}
}

// [ Javascript 문법 ] document.querySelectorAll() 통해 사용자 본인이 작성한 모든 댓글들에 대한 삭제 버튼들이 NodeList 자료형 배열에 배열의 요소로 담김
// [ Javascript 문법 ] .forEach((btn)=>{ btn.addEventListener('click', ) }); 통해 NodeList 자료형 배열의 각 요소들(즉, 삭제 버튼)에 클릭 이벤트 리스너를 부착하여 서버단으로 DELETE 요청 보내주는 RequestDeleteComment 함수가 실행될 수 있도록 만듦
commentDeleteBtn.forEach((btn)=>{
	// btn.addEventListener('click', ()=>{console.log('이거 삭제하려고 방금 클릭했음', btn, btn.parentElement.dataset)});
	btn.addEventListener('click', RequestDeleteComment);
});

// [ Javascript 문법 ] 프론트엔드(watch.pug)단에 페이크 댓글 만드는 함수
const addComment = (text, newCommentId) => {

		const videoComments = document.querySelector(".video__comments ul");
		
		const newComment = document.createElement("li");

		newComment.className = "video__comment";
		
		// [ Javascript 문법 ] newComment.dataset.id 통해 브라우저단 HTML 상에 <li data-id="newCommentId값"></li> 형태로 페이크 댓글ID 부여 가능함
			// newComment.dataset.id = newCommentId; // [ Javascript 문법 ] .dataset.id = 는 단일용도
		newComment.setAttribute('data-id', `${newCommentId}`); // [ Javascript 문법 ] .setAttribute() 는 다용도

		const span2 = document.createElement("span");
		span2.classList.add('video__comment-deleteBtn');
		span2.innerText = "❌";
		newComment.appendChild(span2);

		const icon = document.createElement("i");
		icon.className = "fas fa-comment";
		newComment.appendChild(icon);

		const span = document.createElement("span");
		span.innerText = ` ${text}`;
		newComment.appendChild(span);

		videoComments.prepend(newComment);

		newComment.addEventListener('click', RequestDeleteComment);
}

const handleSubmit = async (event) => {
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
	// [ Javascript 문법 ] async / await 문법 적용하여 const response = await fetch() 형태로 코드 구성한 이유 ---> commentSection.js 의 fetch() 통한 POST 통해 videoController.js 의 createComment 함수 내의 일련의 쿼리 코드들 await Comment.create({}) / video.comments.push(postedComment._id); / video.save(); 통해 댓글 POST 완료 후 return res.sendStatus(201); 코드로부터 상태코드를 리턴 받기까지 시간이 걸리기 때문
	const response = await fetch(`/api/videos/${videoId}/comment`, {
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

	// [ Javascript 문법 ] commmentSection.js 는 watch.pug 코드 기반의 자바스크립트 코드이므로 const response = await fetch() 실행 끝난 후에 확인하는 console.log(response); 내용은 브라우저단 콘솔에서 조회 가능함
	console.log('commentSection.js --- response ---', response);

	// [ Javascript 문법 ] console.log(response); 내용 일부분 예시
	// /* status: 201
	// 		statusText: "Created"
	//		type: "basic"
	// 		url: "http://localhost:4000/api/videos/643f57eea2eb1e0f5e81e3b9/comment" */
	const status = response.status;

	// [ Javascript 문법 ] 로그인 사용자가 작성한 댓글에 대해 const response = await fetch() 코드 실행 성공한 경우라면 return res.sendStatus(201); 코드 반환 받게 되므로 if(status === 201) 조건 충족시 실질 DB 조회 없는 페이크 댓글 만들어서 브라우저단 사용자에게 보여줌 (즉, 저수준 UX 경험 제공으로 인해 폐기했던 새로고침 코드 window.location.reload() 를 대체하는 기법)
	// [ Javascript 문법 ] 즉, videoController.js 의 createComment 함수 내의 일련의 쿼리 코드들 await Comment.create({}) / video.comments.push(postedComment._id); / video.save(); 통해 댓글 POST 완료 후 return res.sendStatus(201); 코드 반환
	// [ Javascript 문법 ] 로그인 사용자가 작성한 댓글에 대해 const response = await fetch() 코드 실행 끝난 후 (X: 성공한 후 / videoController.js 의 createComment 함수 내에서 댓글 달기 시도한 영상이 그 사이에 영상게시자에 의해 삭제되어 await Video.findById(id); 결과가 false 가 되어 return res.sendStatus(404); 상태코드로 반환될 수도 있기 때문) 
	if(status === 201){
		// console.log('create fake comment');

		// [ Javascript & Web API 문법 ] videoController.js 의 postedComment 함수 통해 DB 에 댓글 POST 성공시, return res.status(201).json({ newCommentId: postedComment._id }); 코드 통해 페이크 댓글 만드는 데 필요한 댓글ID 가 담긴 JSON 자료형 데이터를 서버가 응답해주면, 프론트엔드단에서 await response.json(); 통해 그 데이터를 인식함
		const { newCommentId } = await response.json();

		// [ Javascript 문법 ] 프론트엔드(watch.pug)단에 페이크 댓글 만드는 함수 호출
		addComment(text, newCommentId);
	}

	// [ Javascript 문법 ] fetch() 통한 POST 요청 후, textarea 내의 사용자 입력값을 비우기
	textarea.value = '';

				// [ Javascript 문법 ] 로그인 사용자가 작성한 댓글에 대해 const response = await fetch() 코드 실행 끝난 후 window.location.reload() 통해 브라우저 새로고침 하여 방금 POST 한 댓글이 브라우저 상에 실시간으로 보여지도록 만듦
				// [ Javascript 문법 ] 로그인 사용자가 작성한 댓글에 대해 const response = await fetch() 코드 실행 끝난 후 (X: 성공한 후 / videoController.js 의 createComment 함수 내에서 댓글 달기 시도한 영상이 그 사이에 영상게시자에 의해 삭제되어 await Video.findById(id); 결과가 false 가 되어 return res.sendStatus(404); 상태코드로 반환될 수도 있기 때문) 
				// window.location.reload() // 새로고침으로 인해 브라우저 깜빡이므로 저수준 UX 경험이어서 코드 폐기

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
