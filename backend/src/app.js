import express from "express";
import cors from "cors";
import { PORT } from "../config/env.js";
import authRouter from "./routes/auth.routes.js";
import usersRouter from "./routes/users.routes.js";
import uniRouter from "./routes/uni.routes.js";
import rsoRouter from "./routes/rso.routes.js";
// import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

// // Middlewares
app.use(
  cors({
    origin: [`http://localhost:${PORT}`, "https://hoppscotch.io"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/universities", uniRouter);
app.use("/api/rsos", rsoRouter);

// Test Route
app.get("/", (req, res) => res.send("Backend is running"));

app.listen(PORT, async () => {
  console.log(`Events Tracker API is running on http://localhost:${PORT}`);
});

export default app;
