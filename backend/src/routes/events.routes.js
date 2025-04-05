import { Router } from "express";
import {
  approvePublicEvent,
  createPublicEvent,
  createEventComment,
  createEventRating,
  getPendingPublicEvents,
  getEventInfo,
  getUserEventComments,
  getEventComments,
} from "../controllers/events.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const eventsRouter = Router();

// General Events Endpoints
eventsRouter.get("/:event_id", authenticateUser, getEventInfo);
eventsRouter.post("/public", authenticateUser, createPublicEvent);
eventsRouter.post(
  "/public/:event_id/approve",
  authenticateUser,
  approvePublicEvent
);
eventsRouter.get("/public/pending", authenticateUser, getPendingPublicEvents);

// Comments Endpoints
eventsRouter.post("/:event_id/comments", authenticateUser, createEventComment);
eventsRouter.get("/:event_id/comments", authenticateUser, getEventComments);
eventsRouter.get(
  "/:event_id/comments/me",
  authenticateUser,
  getUserEventComments
);

// Ratings Endpoints
eventsRouter.post("/:event_id/ratings", authenticateUser, createEventRating);

export default eventsRouter;
