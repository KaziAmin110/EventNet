import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js"; // Database Connection

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => res.send("Backend is running"));

// Example Route
import userRoutes from "./routes/userRoutes.js";
app.use("/users", userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
