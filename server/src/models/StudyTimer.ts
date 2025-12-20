import mongoose from "mongoose";

const studyTimerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "사용자를 인식할 수 없습니다."]
    },
    studyDate: {
        type: String,
    },
    subjects: [{
        subjectName: {
            type: String,
        },
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        },
        duration: {
            type: Number,
        }
    }],
    totalDuration: {
        type: Number,
    }
});
