import express from "express";

// import 하기 전에 export 처리 먼저 해주어야 함
import {watch, edit} from "../controllers/videoController.js"

export const videoRouter = express.Router();

// Router js, Controller js 코드로 이원화하기 전의 형태
/*
const handleWatch = (req, res) => res.send('Watch Video');
const handleEdit = (req, res) => res.send('Edit Video');
videoRouter.get('/watch', handleWatch);
videoRouter.get('/edit', handleEdit);
*/

videoRouter.get('/watch', watch);
videoRouter.get('/edit', edit);

export default videoRouter;