//- [ WebPack 문법 & Pug 문법 ] ★★★★★ webpack.config.js 에서 bundle 처리된 코드 결과물이 브라우저단에 반영된 상태는 아니므로 pug페이지들에 html 기본 구성 골격을 리턴해 주는 extends base.pug 파일 내에서 block 태그(예- block scripts)를 만들어 각 pug페이지별 용도에 맞게 script(src="") 형식의 코드를 통해 목적에 맞는 bundle 처리된 코드를 pug 페이지 내로 불러와야 함
//- [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 ] webpack.config.js 설정을 마쳤다면 server.js 에서 express.static('노출시키려는 폴더명') 코드로 Express를 통해 assets 폴더 공개하기 (즉, 기본적으로 폴더들은 비공개이므로)
//- [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 ] /static/어쩌구 페이지 주소로 접근 요청할 경우 server.js 에서 설정해 놓은 assets app.use("/static", express.static("assets")); 라우터에 의해 assets 폴더가 공개되어 있으므로 그 폴더로 접근시켜줌

// console.log('src/client/js/videoPlayer.js ----  video player');

const playBtn = document.querySelector('#playBtn');
const muteBtn = document.querySelector('#muteBtn');
const time = document.querySelector('#time');
const volumeRange = document.querySelector('#volumeRange');
const video = document.querySelector('video');

// console.log(playBtn,  muteBtn,  time,  volumeRange, video);

const handlePlayClick = (e) => {
  // [ Web API 문법 ] https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
  // [ Web API 문법 ] HTMLMediaElement.paused 는 Returns a boolean that indicates whether the media element is paused.
  if(video.paused){
    video.play(); // 메서드
    
          // [ Web API 문법 ] OLD코드--- function 내에서 텍스트 변경해도 되지만 본 실습에서는 이벤트리스너를 활용함 (즉, 하나의 function 이 하나의 일만 하도록 코드 만들기)
          // [ Javascript 문법 ] 이벤트리스너 기반으로 버튼의 innerText 값을 삼항연산자로 처리함 
          // playBtn.innerText = 'Pause';
  } else {
    video.pause(); // 메서드 Pauses the media playback.
    
          // [ Web API 문법 ] OLD코드--- function 내에서 텍스트 변경해도 되지만 본 실습에서는 이벤트리스너를 활용함 (즉, 하나의 function 이 하나의 일만 하도록 코드 만들기)
          // [ Javascript 문법 ] 이벤트리스너 기반으로 버튼의 innerText 값을 삼항연산자로 처리함
          // playBtn.innerText = 'Play';
  }

  // [ Javascript 문법 ] 이벤트리스너 기반으로 버튼의 innerText 값을 삼항연산자로 처리함
  playBtn.innerText = video.paused ? 'Play' : 'Pause'
}

// [ Web API 문법 ] OLD코드--- function 내에서 button 태그에 대한 텍스트 변경해도 되지만 본 실습에서는 이벤트리스너를 활용함
// [ Javascript 문법 ] 이벤트리스너 기반으로 버튼의 innerText 값을 삼항연산자로 처리함
// const handlePause = () => playBtn.innerText = 'Play';
// const handlePlay = () => playBtn.innerText = 'Pause';

const handleMuteClick = () => {
  if(video.muted){
    video.muted = false;
    // muteBtn.innerText = 'Mute';

  } else {
    video.muted = true;
    // muteBtn.innerText = 'Unmute';

  }

  // [ Javascript 문법 ] 이벤트리스너 기반으로 버튼의 innerText 값을 삼항연산자로 처리함
  muteBtn.innerText = video.muted ? 'Unmute' : 'Mute';
  volumeRange.value = video.muted ? 0 : 0.5;
}

playBtn.addEventListener('click', handlePlayClick);

// [ Web API 문법 ] "무슨 이벤트를 줄지 아직 잘 모르니까 공식 문서에서 이벤트 종류를 찾아보자. 비디오가 멈추면 알려주는 이벤트가 있나?"
// [ Web API 문법 ] 이벤트리스너에서 감지할 수 있는 이벤트 중에는 pause 이벤트와 play 이벤트도 있음
// [ Web API 문법 ] https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// [ Web API 문법 ] puase 이벤트에 대한 설명- Fired when a request to pause play is handled and the activity has entered its paused state, most commonly occurring when the media's HTMLMediaElement.pause() method is called.
// video.addEventListener('pause', handlePause);
// video.addEventListener('play', handlePlay);
// [ Web API 문법 ] OLD코드--- function 내에서 button 태그에 대한 텍스트 변경해도 되지만 본 실습에서는 이벤트리스너를 활용함
// [ Javascript 문법 ] 이벤트리스너 기반으로 버튼의 innerText 값을 삼항연산자로 처리함
muteBtn.addEventListener('click', handleMuteClick);