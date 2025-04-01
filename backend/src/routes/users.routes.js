import { Router } from "express";
import {
  createSuperAdminRole,
  getUserInfo,
  getUserEvents,
} from "../controllers/users.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
const usersRouter = Router();

usersRouter.post("/roles/super_admin", createSuperAdminRole);
usersRouter.get("/me", authenticateUser, getUserInfo);
usersRouter.get("/me/events", authenticateUser, getUserEvents);

export default usersRouter;
