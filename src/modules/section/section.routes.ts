import { asyncHandler } from "./../../utils/errorHandling";
import { RequestHandler, Router } from "express";
import * as sectionService from "./services/section.service";
import { isAuth } from "../../middleware/auth";
import { Roles } from "../../DB/interfaces/user.interface";
import { valid } from "../../middleware/validation";
import { cokkiesSchema } from "../auth/auth.validation";
import { addsectionSchema } from "./section.validation";
const router = Router();

router.post(
  "/add",
  valid(cokkiesSchema) as RequestHandler,
  valid(addsectionSchema) as RequestHandler,
  isAuth([Roles.Instructor, Roles.Admin]),
  asyncHandler(sectionService.addSection)
);

router.put(
  "/:sectionId",
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Instructor, Roles.Admin]),
  asyncHandler(sectionService.updateSection)
);

router.put(
  "/reorder",
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Instructor, Roles.Admin]),
  asyncHandler(sectionService.reorderSections)
);


router.delete(
  "/:sectionId",
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Instructor, Roles.Admin]),
  asyncHandler(sectionService.deleteSection)
);

router.get(
  "/",
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Admin, Roles.Instructor, Roles.User]),
  asyncHandler(sectionService.getSections)
);

router.get(
  "/search",
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Admin, Roles.Instructor, Roles.User]),
  asyncHandler(sectionService.searchSectionBycourse)
);

export default router;
