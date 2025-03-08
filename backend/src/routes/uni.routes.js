import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  createUniversityProfile,
  getAllUniversities,
  getUniversityInfo,
  joinUniversity,
  leaveUniversity,
} from "../controllers/uni.controllers.js";
import {
  createRSO,
  inviteToRSO,
  leaveRSO,
} from "../controllers/rso.controllers.js";

const uniRouter = Router();

uniRouter.post("/", authenticateUser, createUniversityProfile);
uniRouter.post("/:uni_id/join", authenticateUser, joinUniversity);
uniRouter.get("/", authenticateUser, getAllUniversities);
uniRouter.get("/:uni_id", authenticateUser, getUniversityInfo);
uniRouter.delete("/:uni_id/leave", authenticateUser, leaveUniversity);

// RSO Endpoints
uniRouter.post("/:uni_id/rsos", authenticateUser, createRSO);
uniRouter.post("/:uni_id/rsos/:rso_id/invite", authenticateUser, inviteToRSO);
uniRouter.delete("/:uni_id/rsos/:rso_id/leave", authenticateUser, leaveRSO);

export default uniRouter;
