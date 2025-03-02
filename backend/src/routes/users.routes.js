import { Router } from "express";
import { createRole, getUserInfo } from "../controllers/users.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
const usersRouter = Router();

usersRouter.post("/:user_id/roles", createRole);
usersRouter.get("/info", authenticateUser, getUserInfo);

export default usersRouter;
