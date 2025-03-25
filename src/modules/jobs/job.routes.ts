import {
    Router,
    RequestHandler,
  } from "express";
import * as jobsServices from "./services/job.service";
import { asyncHandler } from "../../utils/errorHandling";
import { isAuth } from "../../middleware/auth";
import { Roles } from "../../DB/interfaces/user.interface";

const router = Router();

// Add Category Route
router.post(
  "/add",
  isAuth([Roles.Admin]),
  asyncHandler(jobsServices.addJob)
);

router.get(
  "/all",
  asyncHandler(jobsServices.getAllJobs)
);

router.put(
  "/:jobId",
  isAuth([Roles.Admin]),
  asyncHandler(jobsServices.updateJob)
);

router.delete(
  "/:jobId",
  isAuth([Roles.Admin]),
  asyncHandler(jobsServices.deleteJob)
);

export default router;
