import { Router } from "express";
import {
  approvePublicEvent,
  createPublicEvent,
  getPendingPublicEvents,
} from "../controllers/events.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const eventsRouter = Router();

eventsRouter.post("/public", authenticateUser, createPublicEvent);
eventsRouter.post(
  "/public/:event_id/approve",
  authenticateUser,
  approvePublicEvent
);
eventsRouter.get("/public/pending", authenticateUser, getPendingPublicEvents);

export default eventsRouter;
