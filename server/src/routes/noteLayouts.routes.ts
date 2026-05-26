import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as noteLayout from "../services/noteLayout.service.js";

const router = Router();

// PATCH /api/note-layouts
router.patch("/", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const { openedNotes } = req.body;
    const noteWorkspace = await noteLayout.saveNoteLayout(userId, openedNotes);
    return res.status(200).json({
      success: true,
      message: "워크스페이스가 저장되었습니다.",
      noteWorkspace,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/note-layouts
router.get("/", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const noteWorkspace = await noteLayout.getNoteLayout(userId);
    return res.status(200).json({
      success: true,
      message: "워크스페이스 정보 조회 완료.",
      noteWorkspace,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
