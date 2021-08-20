import express from "express";

// import 하기 전에 export 처리 먼저 해주어야 함
import {edit, remove} from "../controllers/userController.js"

const userRouter = express.Router();

// Router js, Controller js 코드로 이원화하기 전의 형태
/*
const handleEdit = (req, res) => res.send("Edit User");
const handleDelete = (req, res) => res.send("Delete User");
userRouter.get("/edit", handleEdit);
userRouter.get("/delete", handleDelete);
*/

userRouter.get("/edit", edit);
userRouter.get("/delete", remove);

export default userRouter;