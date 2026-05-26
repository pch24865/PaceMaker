import { Router } from "express";
import validate from "../middleware/validate.js";
import { signUpSchema } from "../schemas/signup.schema.js";
import * as auth from "../services/auth.service.js";

const router = Router();

// GET /api/auth/me
router.get("/auth/me", async (req: any, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }
  try {
    const user = await auth.checkSession(userId);
    res.status(200).json({
      success: true,
      message: "인증이 완료되었습니다.",
      user,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/signin
router.post("/signin", async (req: any, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await auth.signin(email, password);
    req.session.userId = user._id;
    res.status(200).json({
      success: true,
      message: "로그인 성공",
      user,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/signup
router.post("/signup", validate(signUpSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await auth.signup(email, password, name);
    res.status(201).json({
      success: true,
      message: "회원가입 성공",
      user,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/signout
router.post("/signout", (req: any, res) => {
  req.session.destroy((error: any) => {
    if (error) {
      return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다" });
    }
    res.clearCookie("connect.sid", {
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({
      success: true,
      message: "로그아웃 성공",
    });
  });
});

export default router;
