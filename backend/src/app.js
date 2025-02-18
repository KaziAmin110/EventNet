import express from "express";
import cors from "cors";
import { PORT } from "../config/env.js";
import {connectToDatabase} from "./database/db.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Routes


// Test Route
app.get("/", (req, res) => res.send("Backend is running"));

// // Example Route
// import userRoutes from "./routes/userRoutes.js";
// app.use("/users", userRoutes);

app.listen(PORT, async () => {
    console.log(
        `Events Tracker API is running on http://localhost:${PORT}`
    );

    await connectToDatabase();
});


export default app;
