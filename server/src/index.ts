import express from "express";
import cors from "cors";
import { connectDB } from "./db/connection.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import User from "./models/User.js";
import validate from "./middleware/validate.js";
import { signUpSchema } from "./schemas/signup.schema.js";
import { createNoteSchema } from "./schemas/createNote.schema.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import * as auth from "./services/auth.service.js";
import * as note from "./services/note.service.js";
import * as noteLayout from "./services/noteLayout.service.js";
import * as party from "./services/party.service.js";

const app = express();

app.set("trust proxy", 1);

const CLIENT_URL = process.env.CLIENT_URL?.replace(/\/$/, "") || "http://localhost:5173";
const allowedOrigins = [CLIENT_URL, CLIENT_URL + "/"];

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

if (!process.env.MONGODB_URI) {
  console.error("CRITICAL: MONGODB_URI is not defined.");
}

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || "",
    collectionName: "sessions",
    ttl: 60 * 60 * 24 * 7,
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  },
});
app.use(sessionMiddleware);

connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello! API is running" });
});

// 세션 인증
app.get("/api/auth/me", async (req: any, res, next) => {
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

// 로그인
app.post("/api/signin", async (req: any, res, next) => {
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

// 회원가입
app.post("/api/signup", validate(signUpSchema), async (req, res, next) => {
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

// 로그아웃
app.post("/api/signout", (req: any, res) => {
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

// 새 노트 생성
app.post("/api/notes", validate(createNoteSchema), requireAuth, async (req: any, res, next) => {
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

// 노트 조회
app.get("/api/notes", requireAuth, async (req: any, res, next) => {
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

// 노트 저장
app.patch("/api/notes/:id", requireAuth, async (req: any, res, next) => {
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

// 노트 삭제
app.delete("/api/notes/:id", requireAuth, async (req: any, res, next) => {
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

// 레이아웃 저장
app.patch("/api/note-layouts", requireAuth, async (req: any, res, next) => {
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

// 레이아웃 조회
app.get("/api/note-layouts", requireAuth, async (req: any, res, next) => {
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

// 파티 목록
app.get("/api/parties", async (req, res, next) => {
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

// 파티 등록
app.post("/api/parties", requireAuth, async (req: any, res, next) => {
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

// 파티 삭제
app.delete("/api/parties/:id", requireAuth, async (req: any, res, next) => {
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

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
