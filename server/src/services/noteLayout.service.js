import NoteWorkspace from "../models/NoteWorkspace.ts";
import AppError from "../utils/AppError.js";

export async function saveNoteLayout(userId, openedNotes) {
  const noteWorkspace = await NoteWorkspace.findOneAndUpdate(
    { userId },
    { $set: { openedNotes } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (!noteWorkspace) {
    throw (404, "노트를 찾을 수 없습니다.");
  }
  if (noteWorkspace.userId.toString() !== userId.toString()) {
    throw (401, "권한이 없습니다.");
  }
  return noteWorkspace;
}

export async function getNoteLayout(userId) {
  // 없어도 도큐먼트 생성
  const noteWorkspace = await NoteWorkspace.findOneAndUpdate(
    { userId },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (noteWorkspace.userId.toString() !== userId.toString()) {
    throw new AppError(401, "권한이 없습니다.");
  }
  return noteWorkspace;
}
