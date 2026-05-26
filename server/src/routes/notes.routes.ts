import { Router } from "express";
import validate from "../middleware/validate.js";
import { createNoteSchema } from "../schemas/createNote.schema.js";
import { requireAuth } from "../middleware/requireAuth.js";
import * as note from "../services/note.service.js";

const router = Router();

// POST /api/notes
router.post("/", validate(createNoteSchema), requireAuth, async (req: any, res, next) => {
  try {
    const { title, theme, tag } = req.body;
    const userId = req.session.userId;
    const newNote = await note.createNote(title, theme, tag, userId);
    res.status(201).json({
      success: true,
      message: "노트가 생성되었습니다.",
      note: newNote,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/notes
router.get("/", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const notes = await note.getNotes(userId);
    return res.status(200).json({
      success: true,
      message: "노트 목록 조회 완료!",
      notes,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notes/:id
router.patch("/:id", requireAuth, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const { title, theme, tag, contents } = req.body;
    const userId = req.session.userId;
    const newNote = await note.saveNote(id, title, theme, tag, contents, userId);
    return res.status(200).json({
      success: true,
      message: "노트 저장 완료!",
      note: newNote,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id
router.delete("/:id", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const deletedNote = await note.deleteNote(id, userId);
    return res.status(200).json({
      success: true,
      message: "노트가 삭제되었습니다.",
      note: deletedNote,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
