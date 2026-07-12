import { Router } from "express";
import { NotificationControllers } from "./notification.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.get("/", auth("candidate", "employer", "admin"), NotificationControllers.getUserNotifications);
router.patch("/read-all", auth("candidate", "employer", "admin"), NotificationControllers.markAllAsRead);
router.delete("/delete-all", auth("candidate", "employer", "admin"), NotificationControllers.deleteAllNotifications);
router.patch("/:id/read", auth("candidate", "employer", "admin"), NotificationControllers.markAsRead);

export const NotificationRoutes = router;
export default NotificationRoutes;
