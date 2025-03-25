import { asyncHandler } from "./../../utils/errorHandling";
import { instructors } from "./../user/services/user.service";
import { Roles } from "./../../DB/interfaces/user.interface";
import { RequestHandler, Router } from "express";
import { multerMemory } from "../../utils/multer";
import * as videoService from "./services/video.service";
import { isAuth } from "../../middleware/auth";
import { FileType } from "../../utils/files.allowed";
import { valid } from "../../middleware/validation";
import { cokkiesSchema } from "../auth/auth.validation";
import { addvideoSchema } from "./video.validation";
const router = Router();

router.post(
  "/add",
  multerMemory(1024 * 1024 * 1024, [...FileType.Videos]).single("video"),
  valid(cokkiesSchema) as RequestHandler,
  valid(addvideoSchema) as RequestHandler,
  isAuth([Roles.Instructor, Roles.Admin]),
  asyncHandler(videoService.addVideo)
);

router.get(
  "/",
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.User, Roles.Instructor, Roles.Admin]),
  asyncHandler(videoService.getVideo)
);

export default router;
