import { Router } from "express";
import { createRole, getUserInfo } from "../controllers/users.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
const usersRouter = Router();

usersRouter.post("/roles", authenticateUser, createRole);
usersRouter.get("/info", authenticateUser, getUserInfo);

export default usersRouter;
