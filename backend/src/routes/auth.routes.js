import { Router } from "express";
import { signUp, signIn, signOut, forgotPassword } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);
authRouter.post('/forgot-password', forgotPassword);



export default authRouter;