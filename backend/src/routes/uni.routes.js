import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  createUniversityProfile,
  getAllUniversities,
  joinUniversity,
} from "../controllers/uni.controllers.js";

const uniRouter = Router();

uniRouter.post("/", authenticateUser, createUniversityProfile);
uniRouter.post("/join", authenticateUser, joinUniversity);
uniRouter.get("/", authenticateUser, getAllUniversities);

export default uniRouter;
 