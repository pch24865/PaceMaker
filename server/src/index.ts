import express from "express";
import cors from "cors";
import { connectDB } from "./db/connection.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import notesRouter from "./routes/notes.routes.js";
import noteLayoutsRouter from "./routes/noteLayouts.routes.js";
import partiesRouter from "./routes/parties.routes.js";

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

app.use("/api", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/note-layouts", noteLayoutsRouter);
app.use("/api/parties", partiesRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
