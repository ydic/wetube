// alert('record');

const startBtn = document.querySelector('#startBtn');
const video = document.querySelector('#preview');

// [ Javascript 문법 ] stream 변수에 든 카메라 데이터 스트림값을 여러 함수에서 각 용도에 맞게 사용해야 하므로, 특정한 함수 내에서 선언/정의 상태였던 const stream = await navigator.mediaDevices.getUserMedia({}) 를 전역변수 let stream 형태로 선언하고, stream = await navigator.mediaDevices.getUserMedia({}) 형태로 정의함
let stream;

const handleStop = () => {
    // [ Javascript 문법 ] .removeEventListener() 및 .addEventListner() 통해 Toggle 방식으로 동작하도록 UI 와 Event 구성
    // [ Javascript 문법 ] (즉, startBtn 요소에 클릭이벤트 발생시, 실행시킬 함수가 교대로 교체되어 연계되도록 구성)
    startBtn.innerText = 'Start Recording';
    startBtn.removeEventListener('click', handleStop);
    startBtn.addEventListener('click', handleStart);
}

const handleStart = () => {
    // [ Javascript 문법 ] .removeEventListener() 및 .addEventListner() 통해 Toggle 방식으로 동작하도록 UI 와 Event 구성
    // [ Javascript 문법 ] (즉, startBtn 요소에 클릭이벤트 발생시, 실행시킬 함수가 교대로 교체되어 연계되도록 구성)
    startBtn.innerText = 'Stop Recording';
    startBtn.removeEventListener('click', handleStart);
    startBtn.addEventListener('click', handleStop);
    
    // [ Web API 문법 ] 녹화 후 저장되게 만들거니까 녹화 작업 먼저 수행해야 함
    // [ Web API 문법 ] new MediaRecorder(stream) 통해 카메라 데이터 스트림 stream 값을 MediaRecorder 에 넣어줌
    // [ Javascript 문법 ] stream 변수에 든 카메라 데이터 스트림값을 여러 함수에서 각 용도에 맞게 사용해야 하므로, 특정한 함수 내에서 선언/정의 상태였던 const stream = await navigator.mediaDevices.getUserMedia({}) 를 전역변수 let stream 형태로 선언하고, stream = await navigator.mediaDevices.getUserMedia({}) 형태로 정의함
    // [ Web API 문법 ] MediaRecorder 객체 내의 state: "inactive" 상태이지만, stream 은 받아 오고 있는 상태(즉, 녹화할 준비가 되어 있으나 비활성 상태)
    const recorder = new MediaRecorder(stream);
    
    // [ Web API 문버 ] recorder.stop(); 통해 dataavailable 이벤트(즉, MediaRecorder 전용 이벤트 중 하나) 가 Web API 구조적으로 자동 실행됨
    // [ Web API 문법 ] dataavailable 이벤트 내에는 녹화된 최종 비디오 데이터 값이 Web API 구조적으로 포함되어 있음
    // [ Web API 문법 ] .ondataavailable 핸들러(즉, MediaRecorder 전용 이벤트 핸들러 중 하나) 통해 dataavailable 이벤트를 다루며, 녹화된 영상을 비롯한 각종 데이터가 담긴 BlobEvent 객체를 Web API 구조적으로 받게 됨
    // [ Web API 문법 ] .ondataavailable 핸들러 코드를 위치를 녹화시작(즉, recorder.start(); ) / 녹화종료(즉, recorder.stop(); ) 코드보다 상위에 위치시킴
    recorder.ondataavailable = (e) => {
    
        console.log('recording done --- ');
        console.log(e); // 녹화된 영상을 비롯한 각종 데이터가 담긴 BlobEvent 객체
        console.log('e.data --- ', e.data); // BlobEvent 객체 내의 Blob 객체(즉, 녹화된 영상)
    }

    // [ Web API 문법 ] recorder.start(); 통해 MediaRecorder 객체 내의 state: "inactive" 상태를 state: "recording" 상태로 바꿈
    console.log('recorder.js --- recoreder --- ',recorder);
    recorder.start();
    console.log('recorder.js --- recoreder --- ',recorder);

    // [ Web API 문법 ] recorder.start(); 후속으로 동작하는 setTimeout() 통해 10초 간 녹화한 후 setTimeout() 내부의 recorder.stop(); 통해 녹화를 마침
    // [ Web API 문법 ] recorder.stop(); 통해 dataavailable 이벤트(즉, MediaRecorder 전용 이벤트 중 하나) 가 Web API 구조적으로 자동 실행됨
    // [ Web API 문법 ] dataavailable 이벤트 내에는 녹화된 최종 비디오 데이터 값이 Web API 구조적으로 포함되어 있음
    setTimeout(() => {
        recorder.stop();
    }, 10000)
}

const init = async () => {
    // [ Web API 문법 ] https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // [ Web API 문법 ] await navigator.mediaDevices.getUserMedia({}) 통해 스트림 데이터를 (즉, 카메라/마이크 기반) 받아옴
    // [ regenerator-runtime 문법 ] 프론트엔드단 코드 async / await 적용 위해 설치 필요? (? 그때는 필요했고 지금은 없어도 된다?)
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
        // video: {width: 640, height: 480},
        // video: { facingMode: 'user'}
    });

    // [ Web API 문법 ] 카메라 데이터 스트림 값을 video.srcObject(즉, 비디오 소스 객체(O)/파일(X) ) 에 넣기
    video.srcObject = stream;
    
    // [ Web API 문법 ] 비디오 소스 객체(즉, .srcObject ) 를 화면에 실시간으로 보여줌
    video.play();

            /*  
                // [ Web API 문법 ] 모바일 전방/후방 카메라 https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

                // let front = false;
                // document.getElementById("flip-button").onclick = () => {
                // front = !front;
                // };

                // const constraints = {
                // video: { facingMode: front ? "user" : "environment" },
                // };
            */


    // [ regenerator-runtime 문법 ] 프론트엔드단에서 async / await 사용하려면 regenerator-runtime 필설치 해야 한다고? console.log(stream); 확인시 프론트엔드 브라우저단 콘솔에서 regeneratorRuntime is not defined 오류(즉, async / await) 감지되지 않음(? 그때는 필요했고 지금은 없어도 된다?)
    // [ regenerator-runtime 문법 ] npm i regenerator-runtime
    // [ regenerator-runtime 문법 ] https://www.npmjs.com/package/regenerator-runtime
    console.log(stream);
}

init();

startBtn.addEventListener('click', handleStart);