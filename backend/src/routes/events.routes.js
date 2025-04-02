import { Router } from "express";
import {
  approvePublicEvent,
  createPublicEvent,
  getPendingPublicEvents,
  createEventComment,
  createEventRating,
} from "../controllers/events.controllers.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const eventsRouter = Router();

// Public Event Endpoints
eventsRouter.post("/public", authenticateUser, createPublicEvent);
eventsRouter.post(
  "/public/:event_id/approve",
  authenticateUser,
  approvePublicEvent
);
eventsRouter.get("/public/pending", authenticateUser, getPendingPublicEvents);

// Comments Endpoints
eventsRouter.post("/:event_id/comments", authenticateUser, createEventComment);

// Ratings Endpoints
eventsRouter.post("/:event_id/ratings", authenticateUser, createEventRating);

export default eventsRouter;
