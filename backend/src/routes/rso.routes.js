import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { createRSO, inviteToRSO } from "../controllers/rso.controllers.js";

const rsoRouter = Router();

rsoRouter.post("/", authenticateUser, createRSO);
rsoRouter.post("/invite", authenticateUser, inviteToRSO)

export default rsoRouter;
