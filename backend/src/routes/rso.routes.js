import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { createRSO } from "../controllers/rso.controllers.js";

const rsoRouter = Router();

rsoRouter.post("/", authenticateUser, createRSO);

export default rsoRouter;
