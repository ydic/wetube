// alert('record');

const startBtn = document.querySelector('#startBtn');
const video = document.querySelector('#preview');

// [ Javascript 문법 ] stream 변수에 든 카메라 데이터 스트림값을 여러 함수에서 각 용도에 맞게 사용해야 하므로, 특정한 함수 내에서 선언/정의 상태였던 const stream = await navigator.mediaDevices.getUserMedia({}) 를 전역변수 let stream 형태로 선언하고, stream = await navigator.mediaDevices.getUserMedia({}) 형태로 정의함
let stream;

// [ Javascript 문법 ] MediaRecorder 값을 받는 recorder 변수를 여러 함수에서 용도에 맞게 사용하기 위해 전역 변수인 let recorder; 형태로 코드 최상단에 선언하는 방식으로 개선함
let recorder;

const handleStop = () => {
    // [ Javascript 문법 ] .removeEventListener() 및 .addEventListner() 통해 Toggle 방식으로 동작하도록 UI 와 Event 구성
    // [ Javascript 문법 ] (즉, startBtn 요소에 클릭이벤트 발생시, 실행시킬 함수가 교대로 교체되어 연계되도록 구성)
    startBtn.innerText = 'Start Recording';
    startBtn.removeEventListener('click', handleStop);
    startBtn.addEventListener('click', handleStart);

    // [ Web API & Javascript 문법 ] handleStop 함수에 recorder.stop(); 코드를 배치하여 녹화 중지 버튼 누르면 녹화 종료되도록 코드 수정함
    // [ Web API & Javascript 문법 ] 즉, 녹화 시작 버튼 누르고 10초 경과 후 setTimeout(() => { recorder.stop(); }, 10000) 코드 통해 녹화 종료시키는 방식은 폐기함
    // [ Javascript 문법 ] MediaRecorder 값을 받는 recorder 변수를 여러 함수에서 용도에 맞게 사용하기 위해 전역 변수인 let recorder; 형태로 코드 최상단에 선언하는 방식으로 개선함
    recorder.stop();
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
    // [ Javascript 문법 ] MediaRecorder 값을 받는 recorder 변수를 여러 함수에서 용도에 맞게 사용하기 위해 전역 변수인 let recorder; 형태로 코드 최상단에 선언하는 방식으로 개선함
    recorder = new MediaRecorder(stream);
    
    // [ Web API 문버 ] recorder.stop(); 통해 dataavailable 이벤트(즉, MediaRecorder 전용 이벤트 중 하나) 가 Web API 구조적으로 자동 실행됨
    // [ Web API 문법 ] dataavailable 이벤트 내에는 녹화된 최종 비디오 데이터 값이 Web API 구조적으로 포함되어 있음
    // [ Web API 문법 ] .ondataavailable 핸들러(즉, MediaRecorder 전용 이벤트 핸들러 중 하나) 통해 dataavailable 이벤트를 다루며, 녹화된 영상을 비롯한 각종 데이터가 담긴 BlobEvent 객체를 Web API 구조적으로 받게 됨
    // [ Web API 문법 ] .ondataavailable 핸들러 코드를 위치를 녹화시작(즉, recorder.start(); ) / 녹화종료(즉, recorder.stop(); ) 코드보다 상위에 위치시킴
    recorder.ondataavailable = (event) => {
    
        // console.log('recording done --- ');
        // console.log(e); // 녹화된 영상을 비롯한 각종 데이터가 담긴 BlobEvent 객체
        console.log('event.data --- ', event.data); // BlobEvent 객체 내의 Blob 객체(즉, 녹화된 영상)

        // [ Web API 문법 ] URL.createObjectURL(event.data); 통해 녹화된 영상 파일을 가리키는 URL 생성
        // [ Web API 문법 ] URL.createObjectURL(event.data); 통해 생성된 URL 은 브라우저 메모리 영역에서만 이용 가능 (즉, 웹사이트 상에 존재하는 URL 속성이 아님)
        // [ Web API 문법 ] 즉, 실제 호스팅 URL 만든 것이 아니라 브라우저 메모리 상에 녹화된 영상 파일을 저장해 두고, 브라우저가 그 파일에 접글할 수 있는 URL(즉, 주소값) 을 발행해 주었음
        const videoFile = URL.createObjectURL(event.data);
        console.log('URL.createObjectURL(event.data); --- ', videoFile);

        // [ Web API 문법 ] video.src = videoFile; 통해서 video 태그(즉, HTML) 에 대해 녹화된 영상 파일을 주입하고, video.srcObject = null; 통해서 기존에 연결돼 있던 실시간 카메라 스트림 데이터는 차단함
        // [ Web API 문법 ] 코드 적용 결과 --- <video id="preview" src="blob:http://localhost:4000/dcefb7c0-fd2c-4f1a-b44e-e00b4e60717b" loop=""></video>
        video.srcObject = null;
        video.src = videoFile;
        
        // [ Web API 문법 ] video.loop = true; 통해 영상 반복 재생
        video.loop = true;
        video.play();
    }

    // 자체보완함 --- ★★★ --- Stop Recording 버튼 누른 후, handleStop() 함수 내의 recorder.stop(); 통해 Web API 구조적으로 dataavailable 이벤트 발생하며, 녹화된 영상을 .ondataavailable 이벤트 핸들러 통해서 다루게 되는데 이 핸들러 내부에 작성한 video.loop = true; video.play(); 코드 통해 녹화된 결과물 영상을 반복 재생해서 보여줌
    // 자체보완함 --- ★★★ --- 이 상태에서 Start Recording 버튼 눌러 녹화 새로 시작하면, 새 녹화 기능은 동작하고 있으나 화면 상에는 직전 녹화된 영상이 계속 반복 재생되고 있는 문제가 있어 이를 하기 코드 통해 자체 보완함
    video.src = null;
    video.srcObject = stream;
    video.play();

    // [ Web API 문법 ] recorder.start(); 통해 MediaRecorder 객체 내의 state: "inactive" 상태를 state: "recording" 상태로 바꿈
        // console.log('recorder.js --- recoreder --- ',recorder);
    recorder.start();
        // console.log('recorder.js --- recoreder --- ',recorder);

        // [ Web API 문법 ] recorder.start(); 후속으로 동작하는 setTimeout() 통해 10초 간 녹화한 후 setTimeout() 내부의 recorder.stop(); 통해 녹화를 마침
        // [ Web API 문법 ] recorder.stop(); 통해 dataavailable 이벤트(즉, MediaRecorder 전용 이벤트 중 하나) 가 Web API 구조적으로 자동 실행됨
        // [ Web API 문법 ] dataavailable 이벤트 내에는 녹화된 최종 비디오 데이터 값이 Web API 구조적으로 포함되어 있음
        // setTimeout(() => {
        //     recorder.stop();
        // }, 10000)
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