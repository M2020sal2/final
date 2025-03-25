import {
    Router,
    RequestHandler,
  } from "express";
import { configureMulter } from "../../utils/multer";
import * as categoryServices from "./services/category.service";
import { valid } from "../../middleware/validation";
import { asyncHandler } from "../../utils/errorHandling";
import { cokkiesSchema } from "../auth/auth.validation";
import { Roles } from "../../DB/interfaces/user.interface";
import { isAuth } from "../../middleware/auth";

const router = Router();
const upload = configureMulter();

// Add Category Route
router.post(
  "/add",
  upload.single("thumbnail"),
  valid(cokkiesSchema) as RequestHandler,
  asyncHandler(categoryServices.addCategory)
);

router.get(
  "/all",
  asyncHandler(categoryServices.getAllCategories)
);

router.put(
  '/update/:categoryId',
   isAuth([Roles.Admin]),
   upload.single('thumbnail'),
   asyncHandler(categoryServices.updateCategory)
);

router.delete(
  '/:categoryId',
   isAuth([Roles.Admin]),
   asyncHandler(categoryServices.deleteCategory)
);

export default router;
