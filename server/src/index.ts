import express from "express";
import cors from "cors";
import { connectDB } from "./db/connection";
import session from "express-session";
import MongoStore from "connect-mongo";
import User from "./models/User";
import validate from "./middleware/validate";
import { signUpSchema } from "./schemas/signup.schema";
import { createNoteSchema } from "./schemas/createNote.schema";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./middleware/requireAuth";
import { createServer } from "http";
import { Server } from "socket.io";
import { errorHandler } from "./middleware/errorHandler";
import * as auth from "./services/auth.service";
import * as note from "./services/note.service";
import * as noteLayout from "./services/noteLayout.service";
import * as party from "./services/party.service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

connectDB();

app.use(
  "/",
  express.static(path.join(__dirname, "../public/out"), {
    extensions: ["html"],
  })
);

app.use(expresson());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 60 * 60 * 24 * 7, // 세션 유효기간: 7일
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    httpOnly: true, // XSS 공격 방지
    secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송 (프로덕션)
    sameSite: "lax", // CSRF 공격 방지
  },
});
app.use(sessionMiddleware);

io.use((socket: any, next) => {
  sessionMiddleware(socket.request as any, {} as any, next);
});

app.get("/", (req, res) => {
  res.status(200)on({ message: "Hello!" });
});

// 세션 인증
app.get("/api/auth/me", async (req: any, res, next) => {
  const userId = req.session.userId;
  try {
    const user = await auth.checkSession(userId);
    res.status(200)on({
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
    // 세션에 사용자 ID 저장
    req.session.userId = user._id;
    // 사용자정보 반환
    res.status(200)on({
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
    res.status(201)on({
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
      console.log("로그아웃 에러:", error);
      return res.status(500)on({
        success: false,
        message: "서버 오류가 발생했습니다",
      });
    }
    res.clearCookie("connect.sid");
    return res.status(200)on({
      success: true,
      message: "로그아웃 성공",
    });
  });
});

// 새 노트 생성
app.post(
  "/api/notes",
  validate(createNoteSchema),
  requireAuth,
  async (req: any, res, next) => {
    try {
      const { title, theme, tag } = req.body;
      const userId = req.session.userId;
      const newNote = await note.createNote(title, theme, tag, userId);
      res.status(201)on({
        success: true,
        message: "노트가 생성되었습니다.",
        note: newNote,
      });
    } catch (err) {
      next(err);
    }
  }
);

//노트 불러오기
app.get("/api/notes", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const notes = await note.getNotes(userId);
    return res.status(200)on({
      success: true,
      message: "노트 목록 조회 완료!",
      notes,
    });
  } catch (err) {
    next(err);
  }
});

// 노트 한 개 저장
app.patch("/api/notes/:id", requireAuth, async (req: any, res, next) => {
  try {
    const id  = req.params['id'];
    const { title, theme, tag, contents } = req.body;
    const userId = req.session.userId;
    const newNote = await note.saveNote(id, title, theme, tag, contents, userId);
    return res.status(200)on({
      success: true,
      message: "노트 저장 완료!",
      note: newNote,
    });
  } catch (err) {
    next(err);
  }
});

//노트 한개 삭제
app.delete("/api/notes/:id", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const deletedNote = await note.deleteNote(id, userId);
    return res.status(200)on({
      success: true,
      message: "노트가 삭제되었습니다.",
      note: deletedNote,
    });
  } catch (err) {
    next(err);
  }
});

// 노트 레이아웃 저장
app.patch("/api/note-layouts", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const { openedNotes } = req.body;
    const noteWorkspace = await noteLayout.saveNoteLayout(userId, openedNotes);
    return res.status(200)on({
      success: true,
      message: "워크스페이스가 저장되었습니다.",
      noteWorkspace,
    });
  } catch (err) {
    next(err);
  }
});

// 노트 레이아웃 조회
app.get("/api/note-layouts", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.session.userId;
    const noteWorkspace = await noteLayout.getNoteLayout(userId);
    return res.status(200)on({
      success: true,
      message: "워크스페이스 정보 조회 완료.",
      noteWorkspace,
    });
  } catch (err) {
    next(err);
  }
});

// 파티 목록 조회 (페이지네이션, 검색)
app.get("/api/parties", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const search = (req.query.search as string) || "";
    const { parties, lastPage } = await party.getPartys(page, search);
    res.status(200)on({
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
    const {
      title,
      category,
      content,
      tag,
      startDate,
      maximumCapacity,
      requiresApproval,
      isOffline,
      locate,
    } = req.body;
    const result = await party.createParty(
      userId,
      title,
      category,
      content,
      tag,
      startDate,
      maximumCapacity,
      requiresApproval,
      isOffline,
      locate
    );
    res.status(201)on({
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
    const partyId = req.params["id"];
    const partyData = await party.deleteParty(userId, partyId);
    res.status(200)on({
      success: true,
      message: "파티가 삭제되었습니다.",
      party: partyData,
    });
  } catch (err) {
    next(err);
  }
});

// 소켓 테스트
io.on("connection", (socket) => {
  const socketSession = (socket.request as any).session;
  if (!socketSession?.userId) {
    return;
  }
  User.findById(socketSession.userId).then((user: any) => {
    if (user) socket.data.name = user.name;
  });
  console.log("a user connected");

  socket.on("join", (room: string, done: () => void) => {
    socket.join(room);
    console.log(socket.data.name, " join room ->", room);
    done();
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log("app listening on port " + PORT);
  });
}

export default app;
