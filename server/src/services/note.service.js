import Note from "../models/Note.ts";
import AppError from "../utils/AppError.js";

export async function createNote(title, theme, tag, userId) {
  const note = new Note({
    title,
    userId,
    theme,
    tag,
  });
  await note.save();

  return note;
}

export async function getNotes(userId) {
  const notes = await Note.find({ userId });
  if (!notes) {
    throw new AppError(404, "노트를 찾을 수 없습니다.");
  }
  return notes;
}

export async function saveNote(id, title, theme, tag, contents, userId) {
  const note = await Note.findOneAndUpdate(
    { userId, _id: id },
    { $set: { contents, title, theme, tag } }
  );
  if (!note) {
    throw new AppError(404, "노트를 찾을 수 없습니다.");
  }
  return note;
}

export async function deleteNote(id, userId) {
  const note = await Note.findById(id);
  if (!note) {
    throw new AppError(404, "노트를 찾을 수 없습니다.");
  }
  if (note.userId.toString() !== userId.toString()) {
    throw new AppError(401, "권한이 없습니다.");
  }

  const deletedNote = await Note.deleteOne({ _id: id });
  return deletedNote;
}
