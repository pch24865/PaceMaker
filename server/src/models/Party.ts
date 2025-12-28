import mongoose from "mongoose";

export const category = ['자율', '어학', '취업', '고시/공무원', '취미/교양', '프로그래밍', '수험', '기타']

const partySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
    },
    category: {
        type: String,
        enum: category,
        default: '자율',
    },
    content: {
        type: String
    },
    tag: {
        type: Array<String>,
    },
    startDate: {
        type: Date,
    },
    maximumCapacity: {
        type: Number
    },
    participants: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }]
    },
    requiresApproval: {
        type: Boolean,
        default: false,
    },
    isOffline: {
        type: Boolean,
    },
    locate: {
        type: String
    },
},
{
    timestamps: true,
});

const Party = mongoose.model("Party", partySchema);

export default Party;