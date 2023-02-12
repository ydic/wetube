//- [ WebPack 문법 & Pug 문법 ] ★★★★★ webpack.config.js 에서 bundle 처리된 코드 결과물이 브라우저단에 반영된 상태는 아니므로 pug페이지들에 html 기본 구성 골격을 리턴해 주는 extends base.pug 파일 내에서 block 태그(예- block scripts)를 만들어 각 pug페이지별 용도에 맞게 script(src="") 형식의 코드를 통해 목적에 맞는 bundle 처리된 코드를 pug 페이지 내로 불러와야 함
//- [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 ] webpack.config.js 설정을 마쳤다면 server.js 에서 express.static('노출시키려는 폴더명') 코드로 Express를 통해 assets 폴더 공개하기 (즉, 기본적으로 폴더들은 비공개이므로)
//- [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 ] /static/어쩌구 페이지 주소로 접근 요청할 경우 server.js 에서 설정해 놓은 assets app.use("/static", express.static("assets")); 라우터에 의해 assets 폴더가 공개되어 있으므로 그 폴더로 접근시켜줌

// console.log('src/client/js/videoPlayer.js ----  video player');

const playBtn = document.querySelector('#playBtn');
const muteBtn = document.querySelector('#muteBtn');
const currentTime = document.querySelector('#currentTime');
const totalTime = document.querySelector('#totalTime');
const volumeRange = document.querySelector('#volumeRange');
const video = document.querySelector('video');
const timeline = document.querySelector('#timeline');
const fullscreenBtn = document.querySelector('#fullScreen');
const videoContainer = document.querySelector('#videoContainer');
const videoControls = document.querySelector('#videoControls');

// [ Javascript 문법 & Node 문법 ] 브라우저단 input(type='range' value='0.5') 초기값과 같은 맥락에서 서버단에서도 초기값으로 video.volume 을 0.5 라고 설정함
// [ Javascript 문법 ] let volumeValue; f라는 전역 변수(즉, 직전(또는 현재 실시간 변경되고 있는) video.volume 값 담아놓을 전역 변수)를 만들어 놓고 Mute 처리 전에 volumeRange.value 값을 미리 받아두었다가 Unmute 시에 그 값을 다시 volumeRange.value 에 부여해줌 (이때, volumeRange 마우스로 드래그하여 변경시 음량 변경되지 않으므로 volumeRange.addEventListener('input', 어쩌구) 로 별도 처리함)
let volumeValue = 0.5;

// [ Javascript 문법 ] video.volume = volumeValue; 실시간 연동 개념의 변수값 대입이 아니라 초기값 지정 용도의 코드
// [ Javascript 문법 ] let volumeValue = 0; video.volume = volumeValue; 조합해 놓으면 Pug단의 input(type='range' value='1') 상태여도 영상재생시 video.volume 초기설정값이 0 이므로 소리나지 않게 됨(단, 이때 video.volume 값이 0 이라고 해서 video.muted 값이 자동으로 true 되지 않음 / 즉, 두 속성은 별개의 속성)
video.volume = volumeValue;
// console.log(`video.muted: ${video.muted}, video.volume: ${video.volume}, volumeValue: ${volumeValue}, volumeRange.value:${volumeRange.value}`)

// console.log(playBtn,  muteBtn,  time,  volumeRange, video);

let controlsTimeout = null;

// ★★★★★ 코드보완요 ----- 영상 재생종료 되더라도 playBtn.innerText 값이 여전히 Pause  라고 표시되고 있으므로 영상 재생종료 시점 감지해 playBtn.innerText 값을 Play 로 변경되로록 코드 보완요
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

let eVolumeValue;

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

  // [ Web API 문법 - 자체보완 ] 사용자가 볼륨조절바 움직여 volumeRange.value = 0 로 만들었을 때, muteBtn.innerText 가 Unmute 로 표현되도록 한 뒤에 사용자가 음소거 해제하려고 Unmute 버튼 누르면, 원본 영상의 소리값과 볼륨조절바 소리값을 0.5 로 적용하여 소리 나게 함
  if( eVolumeValue == '0'){
    video.volume = '0.5';
    volumeValue = '0.5';
  }

  // (즉, 음소거 해제시 직전(또는 현재 실시간 변경되고 있는) 볼륨 값으로 video.volume 에 반영하기 위함)
  volumeRange.value = video.muted ? 0 : volumeValue;
}

// ★★★★★ 코드보완요 [자체보완완료 230205 YEAH] ----- input(type='input' value=0.5) 태그를 움직여 volumeRange.value = 0 되도록 volumeRange.addEventListner('input', 어쩌구) 동작하더라도 muteBtn.innerText 는 여전히 Mute 라고 표시될 뿐, volumeRange.value 값이 0 에 달했으니 Unmute 라고 표시하도록 제어하는 코드는 만들어야 함(코드보완시 기존 값들과 충돌나는데 다른 각도로 접근요)
/*
    1. volume을 0으로 설정했을 때 버튼 innerText가 계속 mute 상태인 문제 해결
    2. volume이 0인 상태에서 Unmute 버튼을 눌러도 mute 상태인 문제 해결

    const clickedMuteBtn = () => {
    if (video.muted) {
    video.muted = false;
    video.volume = 0.5;
    } else {
    video.muted = true;
    video.volume = 0;
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute";
    volumeRange.value = video.muted ? 0 : 0.5;
    };

    const inputVolumeRange = (event) => {
    const {
    target: { value },
    } = event;
    if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
    }

    video.volume = value;

    if (Number(value) === 0) {
    muteBtn.innerText = "Unmute";
    video.muted = true;
    } else {
    video.muted = false;
    muteBtn.innerText = "Mute";
    }
    };
*/

const handleVolumeChange = (event)=>{

  // const {
    //   target: 
    //     { value }
    //   } = event;

  // ★★★★★ video.muted = true 상태일 때는 input(type='range' value='어쩌구') 기반으로 .addEventListent('input', 어쩌구) 함수 만들어서 video.volmue 수치를 올리더라도 video.muted = false 라고 변경하기 전까지는 전혀 소리가 나지 않게되므로 주의
  if(video.muted){
    video.muted = false;
    muteBtn.innerText = 'Mute';
  }

  // 여기서 event.target.value 값을 volumeValue 에 담아놓아야 음소거 해제 됐을 때 전역 변수 초기할당값 let volumeValue = 0.5; 로 무조건 복원되지 않고 음소거 설정하기 전의 볼륨값으로 복원시켜 줄 수 있음
  volumeValue = event.target.value;

  // [ Web API 문법 - 자체보완 ] 사용자가 볼륨조절바 움직여 volumeRange.value = 0 로 만들었을 때, muteBtn.innerText 가 Unmute 로 표현되도록 함
  if(event.target.value === '0'){
    eVolumeValue = event.target.value;
    handleMuteClick();
  }
  
  // 볼륨 조절할 때의 값을 실시간으로 video.volume 에 반영
  // (즉, 음소거 해제시 직전(또는 현재 실시간 변경되고 있는) 볼륨 값으로 video.volume 에 반영하기 위함)
  video.volume = event.target.value;

  console.log(video.muted, video.volume, volumeRange.value, event.target.value);
}

const formatTime = (seconds) => {
  return new Date(seconds * 1000).toISOString().substring(14, 19);
}

const handleLoadedmetadata = () => {
  totalTime.innerHTML = formatTime(Math.floor(video.duration));

  // [ Web API 문법 ] loadedmetadata 이벤트 발생시 감지되는 영상 길이의 값을 타임라인바 input 의 max 속성에 반영시킴
  timeline.max = Math.floor(video.duration);
}

const handleTimeupdate = () => {
  // console.log(video.currentTime, typeof video);
  // console.log(new Date(video.currentTime * 1000).toISOString().substring(14, 19));
  currentTime.innerHTML = formatTime(Math.floor(video.currentTime))

  // [ Web API 문법 ] timeupdate 이벤트 발생시 감지되는 현재 영상 재생 위치 값을 타임라인바 input 의 value 속성에 반영시킴
  timeline.value = Math.floor(video.currentTime);
}

const handleTimelineChange = (event) => {

  // [ Web API 문법 ] .currnetTime 은 getter 기능 뿐만 아니라 setter 기능으로도 조작 가능함
  // [ Web API 문법 ] input 이벤트 발생시 감지되는 타임라인바 재생시점 값(즉, event.target.value)을 영상 재생시점 속성(즉, video.currentTime)에 반영시킴
  // video.currentTime = event.target.value;

  const {
    target: { value },
  } = event;
  
  video.currentTime = value;
}

const handleFullscreen = () => {
  
  // [ Web API 문법 ] https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
  // [ Web API 문법 ] fullscreen 모드가 동작 상태면 document.fullscreenElement 조회시 현재 fullscreen 모드로 보여지는 element 를 파악할 수 있음
  // [ Web API 문법 ] fullscreen 모드가 미동작 상태면 null 반환됨
  let fullscreenElement = document.fullscreenElement;
  
  if(fullscreenElement){
    // [ Web API 문법 ] 문법원칙상 적용대상은 element 가 아닌 document 임 / Document.exitFullscreen()
    document.exitFullscreen();    

    fullscreenBtn.innerText = 'Enter Full Screen'
  } else {
    // [ Web API 문법 & Javascript 문법 ] 자체제작한 controls 들도 fullscreen 모디 적용에 반영시키기 위해 video 요소와 controls 들을 div#videoContainer 태그로 묶음
    // [ Web API 문법 ] 문법원칙상 적용대상은 document 가 아닌 element 임 / Element.requestFullscreen()
    // video.requestFullscreen();
    videoContainer.requestFullscreen();
    
    fullscreenBtn.innerText = 'Exit Full Screen'
  }
}

// [ Web API 문법 ] video 태그에 mousemove 이벤트 발생시 videoControls 보여줌
const handleMousemove = () => {
  // [ Web API 문법 ] 전역변수인 controlsTimeout 에 handleMouseleave 함수 내의 setTimeout() 함수 동작시 생성되는 고유식별값을 저장해 놓았음
  // [ Web API 문법 ] controlsTimeout 값이 null 상태가 아니라면 clearTimeout() 적용하여 handleMouseleave 함수 내의 setTimeout() 동작을 취소시킨 후 전역변수인 controlTimeout 에 저장되어 있는 setTimeout 고유식별값도 null 상태로 재지정하여 초기화 시킴
  if(controlsTimeout){
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }

  // [ Web API 문법 ] showing 클래스를 div#videoControls 에 부착함
  videoControls.classList.add('showing');
}

// [ Web API 문법 ] video 태그에 mouseleave 이벤트 발생시 videoControls 사라지게 만듦
const handleMouseleave = () => {
  // [ Web API 문법 ] mouseleave 이벤트 발생시 setTimeout() 함수에서 지정한 시간 경과 후에 showing 클래스를 div#videoControls 에서 제거함
  controlsTimeout = setTimeout(() => {
    videoControls.classList.remove('showing');
  }, 3000);
  console.log('handleMouseleave ---- controlsTimeout ----', controlsTimeout);
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

// [ HTML 문법 & Javascript 문법 ] input(type='range') 형식의 경우 change 이벤트는 마우스로 range 이동과 무관하고 마우스 버튼을 뗄 때 이벤트로 인식되므로 미채택
// [ HTML 문법 & Javascript 문법 ] input(type='range') 형식의 경우 input 이벤트는 마우스로 range 이동할 때 실시간으로 이벤트로 인식되므로 채택
volumeRange.addEventListener('input', handleVolumeChange)

video.addEventListener('loadedmetadata', handleLoadedmetadata);

video.addEventListener('timeupdate', handleTimeupdate);

timeline.addEventListener('input', handleTimelineChange);

fullscreenBtn.addEventListener('click', handleFullscreen);

video.addEventListener('mousemove', handleMousemove);

video.addEventListener('mouseleave', handleMouseleave);
