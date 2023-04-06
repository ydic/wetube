/*
              const hello = async () => {
                alert('hi! it\'s working');
                const x = await fetch('');
              }

              hello();
              */

// [ WebPack 문법 ] 브라우저단에서 실행될 코드를 보관할 폴더명을 client 로 작명함
// [ WebPack 문법 & SCSS 문법 ] /client/scss/styles.scss 파일을 /src/client/js/main.js 로 import 해야함
/* You may need an appropriate loader(loader 는 파일을 변환하는 장치) to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
   > @import './_variables'; */
import "../scss/styles.scss";

// alert("/client/js/main.js is transformed to bundled code by WebPack");

// console.log("hi");
console.log('main.js --- base.pug 확인용');

// [ regenerator-runtime 문법 ] 프론트엔드단에서 async / await 사용하려면(즉, recorder.js 파일 내의 async / await 문법) regenerator-runtime 필설치 해야 한다고?
// import regeneratorRuntime from "regenerator-runtime";