// [ WebPack 문법 ] 즉, 여러 다른 파일들을 WebPack 으로 포함시키는 방법에 해당함
// [ WebPack 문법 ] commentSection.js 코드를 WebPack 에서 인식할 수 있도록 webpack.config.js 내에 entry { commentSection: BASE_JS + "commentSection.js", } 코드 기재함

// [ Express 문법 ] 오류 내용 - Uncaught TypeError: Cannot read properties of null (reading 'querySelector')
// [ Express 문법 ] 오류 원인 - watch.pug 단에서 if loggedin 조건문 값이 false 인 경우(즉, 비로그인 상태) ID속성인 #commentForm 속성이 브라우저단에 나타나지 않도록 설정한 상황에서 commentSection.js 에서 .querySelector('#commentForm'); 동작하여 오류 발생
const form = document.querySelector('#commentForm');

const textarea = form.querySelector('textarea');
const btn = form.querySelector('button');

const videoContainer = document.querySelector('#videoContainer');

const handleSubmit = (event) => {
	// [ Javascript 문법 ] event.preventDefault(); 통해 브라우저의 default behavior 기본동작(예- 새로고침 / a태그 href(즉, 하이퍼링크))을 중단시킴
	event.preventDefault();

	console.log('commentSection.js --- textarea.value ---', textarea.value);

	const text = textarea.value;

	// [ HTML 문법 ] 댓글을 달려고 하는 영상의 식별값을 얻기 위해 watch.pug 단에서 data-videoid 속성값 읽어오기 (즉, div#videoContainer(data-videoid=video._id)
	const video = videoContainer.dataset.videoid;
	
	console.log('commentSection.js --- videoContainer.dataset.videoid --- ', videoContainer.dataset.videoid);

}

// [ Javascript 문법 ] form 을 submit 했을 때 제출한 내용이 서버단에서 감지되려면 form 의 submit 이벤트를 감지해야 함 (즉, button 의 click 이벤트가 아님)
			// btn.addEventListener('click', handleSubmit)
form.addEventListener('submit', handleSubmit)
