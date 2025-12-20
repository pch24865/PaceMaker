import express from "express";
import cors from "cors";
import {connectDB} from "./db/connection.js"
import session from "express-session";
import MongoStore from "connect-mongo";
import User from "./models/User.ts";
import bcrypt from "bcrypt";
import validate from "./middleware/validate.js";
import { signUpSchema } from "./schemas/signup.schema.js";
import { createNoteSchema } from "./schemas/createNote.schema.js";
import Note from "./models/Note.ts";
import NoteWorkspace from "./models/NoteWorkspace.ts";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./middleware/auth.js";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://localhost:5173",
        credentials: true,
    },
});

const PORT = process.env.PORT;

connectDB();

app.use('/', express.static(path.join(__dirname, '../public/out'), { extensions: ['html'] }));

app.use(express.json());
app.use(cors({
    origin:'https://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
}));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
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
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
})

app.get("/", (req, res) => {
    res.status(200).json({message : "Hello!"});
});

app.get("/api/todos/read", (req, res) => {
    const todoList = [
        {
            id: "1",
            title: "Express 서버 응답 구조 수정하기",
            completed: true
        },
        {
            id: "2",
            title: "Next.js 클라이언트에서 데이터 연결 확인하기",
            completed: false
        },
        {
            id: "3",
            title: "자기계발 앱 기능 구상하기",
            completed: false
        }
    ];
    res.status(200).json(todoList);
});

// 세션 인증 확인
app.get('/api/auth/me', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "로그인 인증 실패",
            })
        }
        return res.status(200).json({
            success: true,
            message: "로그인 인증 성공",
            user: user.toJSON(),
        })
    } catch (error) {
        console.error("Auth check error:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다",
        });
    }
});

// 로그인 기능 구현
app.post('/api/signin', async (req, res) => {
    try{    
        const {email, password} = req.body;

        // 입력 데이터 검증
        if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "이메일과 비밀번호를 입력해주세요",
        });
        }
        // 사용자 찾기
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(404).json({
            success: false,
            message: "이메일 또는 비밀번호를 다시 확인해주세요.",
        });
        }
        // 비밀번호 찾기
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(404).json({
            success: false,
            message: "이메일 또는 비밀번호를 다시 확인해주세요.",
            });
        }

        // 세션에 사용자 ID 저장
        req.session.userId = user._id;

        // 로그인 성공 사용자정보 반환
        res.status(200).json({
            success: true,
            message: "로그인 성공",
            user: user.toJSON(),
        });
    } catch(error){
        console.error("Login error:", error);
        res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다",
    });
    }
});

// 회원가입 기능 구현
app.post('/api/signup', validate(signUpSchema), async (req,res) => {
    try{
        const {email, password, name} = req.body;
        
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "이미 존재하는 이메일입니다",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            email,
            password: hashedPassword,
            name,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "회원가입 성공",
            user: user.toJSON(),
        });

    }catch(error){
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다",
        });
    }
})

// 로그아웃 기능 구현
app.post('/api/signout', (req, res) => {
    req.session.destroy((error) => {
        if(error){
            console.log('로그아웃 에러:', error);
            return res.status(500).json({
                success: false,
                message: "서버 오류가 발생했습니다",
            })
        };
        res.clearCookie("connect.sid");
        return res.status(200).json({
            success: true,
            message: "로그아웃 성공",
        });
    });
})

// 새 노트 생성
app.post('/api/note', validate(createNoteSchema), requireAuth, async (req, res) => {
    try{
        const {title, theme, tag} = req.body;
        const userId = req.session.userId;
        const note = new Note({
            title,
            userId,
            theme,
            tag,
        });
        await note.save();

        res.status(200).json({
            success: true,
            message: "새 노트 생성 완료!",
            note,
        });

    } catch (error) {
        console.error("Create note error:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다",
        });
    }
})

//노트 불러오기
app.get('/api/notes', requireAuth, async (req, res) => {
    try{
        const userId = req.session.userId;
        const notes = await Note.find({userId});
        if(!notes){
            return res.status(404).json({
                success: false,
                message: "노트를 찾을 수 없습니다.",
            });
        }
        return res.status(200).json({
            success: true,
            message: "노트 목록 조회 완료!",
            notes: notes,
        });
    } catch (error) {
        console.error("Get note list error:", error);
        return res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다",
        });
    }
})

// 노트 한 개 저장
app.patch('/api/note', requireAuth, async (req, res) => {
    try{
        const {id, title, theme, tag, contents} = req.body;
        const userId = req.session.userId;
        const note = await Note.findOneAndUpdate({userId, _id: id}, {$set: {contents, title, theme, tag}});
        if (!note){
            return res.status(404).json({
                success: false,
                message: "노트를 찾을 수 없습니다.",
            });
        }
        return res.status(201).json({
            success: true,
            message: "노트 저장 완료!",
            note: note,
        });

    } catch (error) {
        console.error("Get note list error:", error);
        return res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다",
        });
    }
});

//노트 한개 삭제
app.delete('/api/note', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const {id} = req.body;
        const note = await Note.findById(id);
        if(!note){
            return res.status(404).json({
                success: false,
                message: "노트를 찾을 수 없습니다."
            });
        }
        if(note.userId.toString() !== userId.toString()){
            return res.status(401).json({
                success: false,
                message: "권한이 없습니다.",
            })
        }

        await Note.deleteOne({_id:id});

        return res.status(200).json({
            success: true,
            message: "노트가 삭제되었습니다.",
        })
    } catch(error) {
        console.log('delete error: ',error);
        return res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다",
        })
    }
})

// 노트 레이아웃 저장
app.patch('/api/note/layout', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const {openedNotes} = req.body;
        const noteWorkspace = await NoteWorkspace.findOneAndUpdate(
            {userId},{$set:{openedNotes}},{upsert: true, new: true, setDefaultsOnInsert: true});
        if(!noteWorkspace){
            return res.status(404).json({
                success: false,
                message: "노트를 찾을 수 없습니다."
            });
        }
        if(noteWorkspace.userId.toString() !== userId.toString()){
            return res.status(401).json({
                success: false,
                message: "권한이 없습니다.",
            })
        }
        return res.status(200).json({
            success: true,
            message: "워크스페이스가 저장되었습니다.",
            noteWorkspace,
        })
    } catch(error) {
        console.log('delete error: ',error);
        return res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다",
        })
    }
});

// 노트 레이아웃 조회
app.get('/api/note/layout', requireAuth,async (req, res) => {
    try {
        const userId = req.session.userId;
        const noteWorkspace = await NoteWorkspace.findOneAndUpdate(
            {userId},{},{upsert: true, new: true, setDefaultsOnInsert: true});
        if(noteWorkspace.userId.toString() !== userId.toString()){
            return res.status(401).json({
                success: false,
                message: "권한이 없습니다.",
            })
        }
        return res.status(200).json({
            success: true,
            message: "워크스페이스 정보 조회 완료.",
            noteWorkspace
        })
    } catch(error) {
        console.log('delete error: ',error);
        return res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다",
        })
    }
});

// 소켓 테스트
io.on("connection", (socket) => {
    // Todo 세션확인.
    const socketSession = socket.request.session;
    console.log(socketSession.userId);
    if (!socketSession.userId){
        return;
    }
    User.findById(socketSession.userId).then((user) => {
        socket.data.name = user.name;
    })
    console.log("a user connected");

    socket.on("join", (room, done) => {
        socket.join(room);
        console.log(socket.data.name, ' join room ->', room)
        done();
    })
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});


server.listen(PORT, () => {
    console.log("app listening on port "+ process.env.PORT);
});

// SPA 라우팅을 위한 Catch-all 라우트 (API 요청이 아닌 경우 index.html 반환)
app.get(/.*/, (req, res) => {
    // API 요청은 제외 (이미 위에서 처리되지 않은 API 요청은 404가 되어야 함, 하지만 여기서는 간단히 모든 GET 요청을 index.html로 보냄)
    // 만약 API 404를 구분하고 싶다면 req.path.startsWith('/api') 체크 필요
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: "API endpoint not found"
        });
    }
    res.sendFile(path.join(__dirname, '../public/out/index.html'));
});