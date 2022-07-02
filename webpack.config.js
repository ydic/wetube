// [ WebPack 문법 ] npm i -D webpack webpack-cli
// [ WebPack 문법 ] https://www.npmjs.com/package/webpack
// [ WebPack 문법 ] WebPack CLI (설치용 고유명사는 webpack-cli) 통해서 console 환경에서 WebPack 기능 사용 가능함
// [ WebPack 문법 ] 브라우저 이해 가능 형태로 변환한 Javascript 와 CSS(<-SCSS) 를 각각 /src/client/js/ 폴더와 /src/client/scss/ 폴더에 저장함

// [ WebPack 문법 ] 파일명을 webpack.config.js(주의! JS 와 Nodejs 구식코드로만 인식가능) 로 필생성해야 하며 Javascript 와 SCSS 관련 내용을 모두 지닌 본 파일을 통해 직접 사전 설정해 놓은 변형 방법에 맞춰 /src/client/js/main.js 파일을 변형시킴
// [ WebPack 문법 ] 예- WebPack 이 Javascript 코드 감지하면 WebPack 내부에 위치시킨 Babel 을 이용해 변환 처리
// [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 ] webpack.config.js 설정을 마쳤다면 server.js 에서 express.static('노출시키려는 폴더명') 코드로 Express를 통해 assets 폴더 공개하기 (즉, 기본적으로 폴더들은 비공개이므로)
// [ WebPack & 시큐어 보안 코딩 & Express 라이브러리 문법 & Pug 문법 ] base.pug 가 bundle 처리된 /assets/js/main.js 파일을 불러올 수 있도록 연결해야 함 script(src='/static/js/main.js')

// [ WebPack 문법 ] 변형 처리된 Javascript 파일의 output 은 /assets/js/main.js 에 기록되며 모든 브라우저가 이해할 수 있는 상태의 코드로 변모함
// [ WebPack 문법 ] assets 폴더 내 파일은 건드리지 말아야 하며 client 폴더만 수정 가능함

// [ WebPack 문법 ] sass-loader 통해서 SCSS 코드를 일반 CSS 코드로 변환함
// [ WebPack 문법 ] css-loader 로 넘겨받은 후 진행중인 모든 import 처리함
// [ WebPack 문법 ] CSS 로 컴파일 된 코드를 MiniCssExtractPlugin 통해서 ★★★★/css/styles.css 에 입력을 마친 뒤 output 디렉토리(즉, 여기서는 /assets/css/styles.css) 로 파일 이동 처리함
// [ WebPack 문법 ] MiniCssExtractPlugin 플러그인의 기능: CSS into separate files. It creates a CSS file per JS file which contains CSS.

// [ WebPack 문법 ] 변형된 Javascript 와 CSS 를 Pug 통해서 프론트엔드 템플릿(즉, /src/views/base.pug) 에 적용함
// [ WebPack 문법 ] 변형된 Javascript 와 CSS 는 본 실습에서 server.js 에 express.static() 기능을 반영한 라우팅인 일명 /static URL 경로(즉, app.use('/static', express.static('assets); )를 통해서만 접근 가능하며 브라우저단에서 assets 폴더의 내용을 볼 수 있도록 정의됨

// [ WebPack 문법 ] watch: true 설정해야 하고 2개 console 실행요(즉, package.json 의 scripts 에 설정한 실행 단축명령어 / client 파일 확인용 npm run assets / backend 파일 확인용 npm run dev)
// [ WebPack 문법 ] 기능 정상 동작하지 않을 경우, WebPack console 실행했는지 확인요

// [ WebPack 문법 ] package.json 의 scripts 항목에 지정한 "dev:server": "nodemon" 속성이 실행되면 nodemon.json 파일의 configuration 내용을 읽도록 설정함(즉, 별도 json 파일로 이원화시켜 관리하되 내용은 여전히 package.json 에 종속되도록 함)
// [ WebPack 문법 ] 이러한 맥락은 "dev:assets": "webpack" 속성 실행시에도 적용되는데 자동으로 webpack.config.js 파일을 찾게 됨

// [ Nodejs 문법 ] ReferenceError: path is not defined
// [ Nodejs 문법 ] path 기능은 module.exports = { output: { path: path.resolve(__dirname, "assets", "js"),}} 에서 사용됨
const path = require("path");

console.log("webpack.config.js ---- __dirname ----     ", __dirname);
console.log(
  "webpack.config.js ----path.resolve(__dirname, 'assets', 'js') -----    ",
  path.resolve(__dirname, "assets", "js")
);

// [ WebPack 문법 & Nodejs 문법 ] 구식코드인 module.exports 만 인식가능 (신식코드인 export default 인식불가)
// [ WebPack 문법 & Nodejs 문법 ] module.exports 통해서 WebPack 이 읽을 configuration 파일 내보내기
// [ WebPack 문법 ] npm i -D webpack webpack-cli 설치 이후에 package.json 에서 Webpack 실행명령어 단축 표기(npm run assets) 지정함 scripts": { "assets": "webpack --config webpack.config.js" }
module.exports = {
  // [ WebPack 문법 ] entry 항목에는 WebPack 통해 변형시키려는 원본 소스 코드의 경로를 기재함
  entry: "./src/client/js/main.js",

  // [ WebPack 문법 ] 실제 배포시에는 mode: "production" 으로 설정요 / 개발시에는 mode: "development" 설정하여 압축되지 않은 코드 형태로 코드를 다룰 수 있음
  mode: "development",

  output: {
    // [ WebPack 문법 ] output 의 filename 항목에는 변형 처리 결과물을 위한 파일명을 지정해야 함
    // [ WebPack 문법 ] 브라우저가 읽어들일 코드는 clients 폴더가 아니라 코드가 bundle 처리되어진 assets 폴더의 코드
    filename: "main.js",

    // [ WebPack 문법 ] Invalid configuration object. configuration.output.path: The provided value "./assets/js" is not an absolute path!
    // path: './assets/js'
    // [ Github 라이브러리 문법 ] .gitignore 에 /assets 표기함
    // [ WebPack 문법 ] 주의! 폴더명 assets 는 본 실습을 위해 작명됨
    // [ WebPack 문법 ] output 의 path 항목에는 변형 처리 결과물을 저장할 경로를 지정해야 함
    // [ WebPack 문법 ] output 의 path 값은 절대경로여야 함 The provided value "./assets/js" is not an absolute path!
    // [ Nodejs 문법 ] path.resolve() 는 파트들을 모아서 경로를 만들어 줌
    // [ Nodejs 문법 ] __dirnmae 통해서 코드파일 자신이 위치한 파일 경로를 알 수 있음
    path: path.resolve(__dirname, "assets", "js"),
  },

  module: {
    //  [ WebPack & Babel 문법 ] rules 속성 지정을 통해 각각의 파일 종류에 따라 어떤 변환을 할 건지 사전 설정해 놓기
    rules: [
      {
        // [ WebPack & Babel 문법 ] 본 실습에서는 프론트엔드, 백엔드 양단 javascript 파일에 대해서 babel-loader를 사용해 bundle 처리함
        // [ 정규표현식 ] test: /\.js$/
        test: /\.js$/,
        // [ WebPack & Babel 문법 ] https://github.com/babel/babel-loader
        // [ WebPack & Babel 문법 ] Babel 가이드 공식 문서 npm install -D babel-loader @babel/core @babel/preset-env webpack
        // [ WebPack & Babel 문법 ] 본 단계 nmd wetube 코딩 시점 기준 설치요 npm install -D babel-loader
        // [ WebPack 문법 ] 실제 배포시에는 mode: "production" 으로 설정요 / 개발시에는 mode: "development" 설정하여 압축되지 않은 코드 형태로 코드를 다룰 수 있음
        // The 'mode' option has not been set, webpack will fallback to 'production' for this value.

        // [ WebPack 문법 ] 파일 변환 장치인 loader 호출 방법 2가지(Object 객체 활용방식 / 역순 Array 배열 활용방식)
        use: {
          // [ WebPack & Babel 문법 ] https://github.com/babel/babel-loader
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },

      {
        // [ 정규표현식 ] test: /\.scss$/
        test: /\.scss$/,

        // [ WebPack 문법 ] SCSS 를 일반 CSS 파일로 변환 후 브라우저단에서 불러오기
        // [ WebPack 문법 ] 파일 변환 장치인 loader 호출 방법 2가지(Object 객체 활용방식 / 역순 Array 배열 활용방식)

        /* You may need an appropriate loader(loader 는 파일을 변환하는 장치) to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
        > @import './_variables'; */
        // https://www.npmjs.com/package/sass-loader
        // [ WebPack 문법 & SCSS 문법 ] sass-loader 통해서 SCSS 를 일반 CSS 로 변환하기
        // npm install sass-loader sass --save-dev

        // https://www.npmjs.com/package/css-loader
        // [ WebPack 문법 & SCSS 문법 ] css-loader 통해서 @import / URL() / 폰트 같은 속성을 풀어서 해석 적용하기(즉, 변환 처리된 최종 javascript 코드에는 웹사이트에 입력되기 위해 CSS 가 컴파일된 형태로 담기게 됨)
        // npm install --save-dev css-loader

        // https://www.npmjs.com/package/style-loader
        // [ WebPack 문법 & SCSS 문법 ] 일반 CSS 로 변환된 내용을 style-loader 통해서 웹사이트에 적용하기(즉, <head></head> 태그 내의 <style></style> 태그 내에 CSS 속성이 담겨짐)
        // npm install --save-dev style-loader
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
};
