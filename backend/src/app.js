import express from "express";
import cors from "cors";
import { PORT } from "../config/env.js";
// import { connectToDatabase } from "./database/db.js";
import authRouter from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();
// // Middlewares
app.use(
  cors({
    origin: 'http://localhost:5500',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(errorMiddleware);
app.use(cookieParser());


// Routes
app.use("/api/auth", authRouter);

// Test Route
app.get("/", (req, res) => res.send("Backend is running"));

// // Example Route
// import userRoutes from "./routes/userRoutes.js";
// app.use("/users", userRoutes);

app.listen(PORT, async () => {
  console.log(`Events Tracker API is running on http://localhost:${PORT}`);
});

export default app;
