import { Router } from "express";
import {
  approvePublicEvent,
  createPublicEvent,
} from "../controllers/events.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const publicEventsRouter = Router();

publicEventsRouter.post("/", authenticateUser, createPublicEvent);
publicEventsRouter.post(
  "/:event_id/approve",
  authenticateUser,
  approvePublicEvent
);

export default publicEventsRouter;
