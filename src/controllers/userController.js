export const join = (req, res) => res.send("Join");
export const edit = (req, res) => res.send("Edit User ctrl");

// delete는 JS 예약어라서 변수명으로 선언 불가, 변수명을 remove로 대체 선언
export const remove = (req, res) => res.send("Remove User ctrl");

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가
//export default join;
