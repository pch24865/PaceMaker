import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as party from "../services/party.service.js";

const router = Router();

// GET /api/parties
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const search = (req.query.search as string) || "";
    const { parties, lastPage } = await party.getPartys(page, search);
    res.status(200).json({
      success: true,
      message: "파티 목록 조회완료.",
      parties,
      lastPage,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/parties
router.post("/", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const { title, category, content, tag, startDate, maximumCapacity, requiresApproval, isOffline, locate } = req.body;
    const result = await party.createParty(userId, title, category, content, tag, startDate, maximumCapacity, requiresApproval, isOffline, locate);
    res.status(201).json({
      success: true,
      message: "파티 생성 완료.",
      party: result,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/parties/:id
router.delete("/:id", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const partyData = await party.deleteParty(userId, id);
    res.status(200).json({
      success: true,
      message: "파티가 삭제되었습니다.",
      party: partyData,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
