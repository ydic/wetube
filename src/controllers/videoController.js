export const trending = (req, res) => res.send("Trending Video ctrl");
export const watch = (req, res) => res.send("Watch Video ctrl");
export const edit = (req, res) => res.send("Edit Video ctrl");

// videoControllers.js에서 videoRouter.js로 export 해야할 함수가 2개 이상이므로 export default 적용 불가
//export default trending;
