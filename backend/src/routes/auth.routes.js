import { Router } from "express";
import {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
  refreshAccess,
} from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/", resetPassword);
authRouter.get("/refresh", refreshAccess);

export default authRouter;
