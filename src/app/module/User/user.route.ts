import { Router } from "express";
import { UserControllers } from "./user.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.get("/", auth("admin"), UserControllers.getAllUsers);

router.patch("/:id/status", auth("admin"), UserControllers.updateUserStatus);

router.delete("/:id", auth("admin"), UserControllers.deleteUser);

export const UserRoutes = router;
export default UserRoutes;
