import mongoose from "mongoose";

// [ mongoose 문법 ] 댓글을 위한 new mongoose.Schema({}) 작성
const commentSchema = new mongoose.Schema({
	// [ mongoose 문법 ] 댓글 작성자(즉, type: mongoose.Schema.Types.ObjectId) 에 대한 정보를 ref: 'User' 모델에서 참조
	owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

	// [ mongoose 문법 ] 댓글이 작성된 영상(즉, type: mongoose.Schema.Types.ObjectId) 에 대한 정보를 ref: 'Video' 모델에서 참조
	video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Video' },

	// [ mongoose 문법 ] 작성된 댓글 내용
	text: { type: String, required: true },
	
	createdAt: { type: Date, required: true, default: Date.now },
})

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;