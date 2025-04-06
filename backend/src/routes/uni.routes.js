import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  createUniversityProfile,
  getAllUniversities,
  getUniversityInfo,
  joinUniversity,
  leaveUniversity,
  getUserUniversities,
  getJoinableUniversities,
} from "../controllers/uni.controllers.js";
import {
  createRSO,
  inviteToRSO,
  getAllRSOs,
  leaveRSO,
  joinRSO,
  getUserRSOs,
} from "../controllers/rso.controllers.js";

import {
  createUniversityEvent,
  createRSOEvent,
} from "../controllers/events.controllers.js";

const uniRouter = Router();

// University Endpoints
uniRouter.post("/", authenticateUser, createUniversityProfile);
uniRouter.post("/:uni_id/join", authenticateUser, joinUniversity);
uniRouter.get("/", authenticateUser, getAllUniversities);
uniRouter.get("/me", authenticateUser, getUserUniversities);
uniRouter.get("/joinable", authenticateUser, getJoinableUniversities);
uniRouter.get("/:uni_id", authenticateUser, getUniversityInfo);
uniRouter.delete("/:uni_id/leave", authenticateUser, leaveUniversity);

// University Events Endpoints
uniRouter.post("/:uni_id/events", authenticateUser, createUniversityEvent);

// RSO Endpoints
uniRouter.post("/:uni_id/rsos", authenticateUser, createRSO);
uniRouter.post("/:uni_id/rsos/:rso_id/invite", authenticateUser, inviteToRSO);
uniRouter.post("/rsos/join_rso", joinRSO);
uniRouter.get("/:uni_id/rsos", authenticateUser, getAllRSOs);
uniRouter.get("/rsos/me", authenticateUser, getUserRSOs);
uniRouter.delete("/:uni_id/rsos/:rso_id/leave", authenticateUser, leaveRSO);

// RSO Events Endpoints
uniRouter.post(
  "/:uni_id/rsos/:rso_id/events",
  authenticateUser,
  createRSOEvent
);

export default uniRouter;
