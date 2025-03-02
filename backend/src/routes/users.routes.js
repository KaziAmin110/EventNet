import { Router } from "express";
import { createSuperAdminRole, getUserInfo } from "../controllers/users.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
const usersRouter = Router();

usersRouter.post("/roles/super_admin", createSuperAdminRole);
usersRouter.get("/me", authenticateUser, getUserInfo);

export default usersRouter;
