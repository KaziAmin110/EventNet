import { Router } from "express";
import { createPublicEvent } from "../controllers/events.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const publicEventsRouter = Router();

publicEventsRouter.post("/", authenticateUser, createPublicEvent);

export default publicEventsRouter;
