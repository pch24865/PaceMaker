import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "사용자를 인식할 수 없습니다."],
    },
    title: {
        type: String,
        required: [true, "제목을 입력해주세요."],
    },
    theme: {
        type: String,
    },
    tag: {
        type: String,
    },
    contents: {
        type: Array,
    },
}, {
    timestamps: true,
});

const Note = mongoose.model("Note", noteSchema);

export default Note;
