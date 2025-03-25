import { Router } from "express";
import userRouter from "./modules/user/user.routes";
import authRouter from "./modules/auth/auth.routes";
import categoryRouter from "./modules/category/category.routes";
import courseRouter from "./modules/course/course.routes";
import videoRouter from "./modules/video/video.routes";
import sectionRouter from "./modules/section/section.routes";
import jobRouter from "./modules/jobs/job.routes";

const router = Router();
router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/category", categoryRouter);
router.use("/course", courseRouter);
router.use("/video", videoRouter);
router.use("/section", sectionRouter);
router.use("/job", jobRouter);

export default router;
