import { Router } from "express";
import { AuthRoutes } from "../module/Auth/auth.route";
import { JobRoutes } from "../module/Job/job.route";
import { ApplicationRoutes } from "../module/Application/application.route";
import { ProfileRoutes } from "../module/Profile/profile.route";
import { ChatRoutes } from "../module/Chat/chat.route";
import { CategoryRoutes } from "../module/Category/category.route";
import { UserRoutes } from "../module/User/user.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/jobs", JobRoutes);
router.use("/applications", ApplicationRoutes);
router.use("/profile", ProfileRoutes);
router.use("/chat", ChatRoutes);
router.use("/categories", CategoryRoutes);
router.use("/users", UserRoutes);

export default router;


