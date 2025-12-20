import mongoose from "mongoose";

const noteWorkspaceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    openedNotes: [{
        noteId: { type: String, required: true },
        xRate: Number,
        yRate: Number,
        widthRate: Number,
        heightRate: Number,
        zIndex: Number,
        fullScreen: Boolean,
    }],
}, {
    timestamps: true,
});

const NoteWorkspace = mongoose.model("Note_Workspace", noteWorkspaceSchema);

export default NoteWorkspace;
