import { RequestHandler, Router } from "express";
import * as courseServices from "./services/course.service";
import {
  addCourseSchema,
  getCourseByIdSchema,
  searchCoursesInstructorScheam,
  searchCoursesScheam,
  updateCourseSchema,
} from "./course.validation";
import { valid } from "../../middleware/validation";
import { asyncHandler } from "../../utils/errorHandling";
import { isAuth } from "../../middleware/auth";
import { Roles } from "./../../DB/interfaces/user.interface";
import { cokkiesSchema } from "../auth/auth.validation";
import { multerMemory } from "../../utils/multer";
import { FileType } from "../../utils/files.allowed";

const router = Router();
const upload = multerMemory(5 * 1024 * 1024, FileType.Images);

// Add Course (Only Instructors & Admins)
router.post(
  "/add",
  upload.single("thumbnail"),
  valid(cokkiesSchema) as RequestHandler,
  valid(addCourseSchema) as RequestHandler,
  isAuth([Roles.Instructor, Roles.Admin]),
  asyncHandler(courseServices.addCourse)
);

// Get All Courses
router.get(
  "/all",
  valid(searchCoursesScheam) as RequestHandler,
  asyncHandler(courseServices.getAllCourses)
);

//get instructor course
router.get(
  "/instructor/courses",
  valid(searchCoursesInstructorScheam) as RequestHandler,
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Instructor]),
  asyncHandler(courseServices.getAllCoursesForInstructor)
);

// Get Course By ID
router.get(
  "/:id",
  valid(getCourseByIdSchema) as RequestHandler,
  asyncHandler(courseServices.getCourseById)
);

// Update Course (Only Instructors & Admins)
router.put(
  "/:id",
  valid(cokkiesSchema) as RequestHandler,
  valid(updateCourseSchema) as RequestHandler,
  isAuth([Roles.Instructor, Roles.Admin]),
  asyncHandler(courseServices.updateCourse)
);

// Delete Course (Only Instructors & Admins)
router.delete(
  "/:id",
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Instructor, Roles.Admin]),
  asyncHandler(courseServices.deleteCourse)
);

router.post("/search", asyncHandler(courseServices.searchCollection));

export default router;
