import { Router } from "express";
import {
  approvePublicEvent,
  createPublicEvent,
  getInvalidPublicEvents,
} from "../controllers/events.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const publicEventsRouter = Router();

publicEventsRouter.post("/", authenticateUser, createPublicEvent);
publicEventsRouter.post(
  "/:event_id/approve",
  authenticateUser,
  approvePublicEvent
);
publicEventsRouter.get("/pending", authenticateUser, getInvalidPublicEvents);

export default publicEventsRouter;
