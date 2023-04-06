// alert('record');

const startbtn = document.querySelector('#startBtn');

const handleStart = async () => {
    // [ Web API 문법 ] https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // [ Web API 문법 ] await navigator.mediaDevices.getUserMedia({}) 통해 스트림 데이터를 (즉, 카메라/마이크 기반) 받아옴
    // [ regenerator-runtime 문법 ] 프론트엔드단 코드 async / await 적용 위해 설치 필요? (? 그때는 필요했고 지금은 없어도 된다?)
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    });


    // [ regenerator-runtime 문법 ] 프론트엔드단에서 async / await 사용하려면 regenerator-runtime 필설치 해야 한다고? console.log(stream); 확인시 프론트엔드 브라우저단 콘솔에서 regeneratorRuntime is not defined 오류(즉, async / await) 감지되지 않음(? 그때는 필요했고 지금은 없어도 된다?)
    // [ regenerator-runtime 문법 ] npm i regenerator-runtime
    // [ regenerator-runtime 문법 ] https://www.npmjs.com/package/regenerator-runtime
    console.log(stream);
}

startbtn.addEventListener('click', handleStart);