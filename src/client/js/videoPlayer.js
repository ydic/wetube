//- [ WebPack 문법 & Pug 문법 ] ★★★★★ webpack.config.js 에서 bundle 처리된 코드 결과물이 브라우저단에 반영된 상태는 아니므로 pug페이지들에 html 기본 구성 골격을 리턴해 주는 extends base.pug 파일 내에서 block 태그(예- block scripts)를 만들어 각 pug페이지별 용도에 맞게 script(src="") 형식의 코드를 통해 목적에 맞는 bundle 처리된 코드를 pug 페이지 내로 불러와야 함
//- [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 ] webpack.config.js 설정을 마쳤다면 server.js 에서 express.static('노출시키려는 폴더명') 코드로 Express를 통해 assets 폴더 공개하기 (즉, 기본적으로 폴더들은 비공개이므로)
//- [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 ] /static/어쩌구 페이지 주소로 접근 요청할 경우 server.js 에서 설정해 놓은 assets app.use("/static", express.static("assets")); 라우터에 의해 assets 폴더가 공개되어 있으므로 그 폴더로 접근시켜줌

// console.log('src/client/js/videoPlayer.js ----  video player');

const playBtn = document.querySelector('#playBtn');
const muteBtn = document.querySelector('#muteBtn');
const time = document.querySelector('#time');
const volumeRange = document.querySelector('#volumeRange');
const video = document.querySelector('video');

// [ Javascript 문법 & Node 문법 ] 브라우저단 input(type='range' value='0.5') 초기값과 같은 맥락에서 서버단에서도 초기값으로 video.volume 을 0.5 라고 설정함
// [ Javascript 문법 ] let volumeValue; f라는 전역 변수(즉, 직전(또는 현재 실시간 변경되고 있는) video.volume 값 담아놓을 전역 변수)를 만들어 놓고 Mute 처리 전에 volumeRange.value 값을 미리 받아두었다가 Unmute 시에 그 값을 다시 volumeRange.value 에 부여해줌 (이때, volumeRange 마우스로 드래그하여 변경시 음량 변경되지 않으므로 volumeRange.addEventListener('input', 어쩌구) 로 별도 처리함)
let volumeValue = 0.5;
video.volume = volumeValue;

// console.log(playBtn,  muteBtn,  time,  volumeRange, video);


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

  // (즉, 음소거 해제시 직전(또는 현재 실시간 변경되고 있는) 볼륨 값으로 video.volume 에 반영하기 위함)
  volumeRange.value = video.muted ? 0 : volumeValue;
}

// ★★★★★ 코드보완요 ----- input(type='input' value=0.5) 태그를 움직여 volumeRange.value = 0 되도록 volumeRange.addEventListner('input', 어쩌구) 동작하더라도 muteBtn.innerText 는 여전히 Mute 라고 표시될 뿐, volumeRange.value 값이 0 에 달했으니 Unmute 라고 표시하도록 제어하는 코드는 만들어야 함(코드보완시 기존 값들과 충돌나는데 다른 각도로 접근요)
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
  
  // 볼륨 조절할 때의 값을 실시간으로 video.volume 에 반영
  // (즉, 음소거 해제시 직전(또는 현재 실시간 변경되고 있는) 볼륨 값으로 video.volume 에 반영하기 위함)
  video.volume = event.target.value;

  console.log(video.muted, video.volume, volumeRange.value, event.target.value);
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