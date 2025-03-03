import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  createUniversityProfile,
  getAllUniversities,
  getUniversityInfo,
  joinUniversity,
} from "../controllers/uni.controllers.js";

const uniRouter = Router();

uniRouter.post("/", authenticateUser, createUniversityProfile);
uniRouter.post("/join", authenticateUser, joinUniversity);
uniRouter.get("/", authenticateUser, getAllUniversities);
uniRouter.get("/:uni_id", authenticateUser, getUniversityInfo);

export default uniRouter;
