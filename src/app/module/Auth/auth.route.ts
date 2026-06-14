import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { registerValidationSchema, loginValidationSchema } from "./auth.validation";
import { auth } from "../../middleware/auth";

const router = Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  AuthControllers.register
);

router.post(
  "/login",
  validateRequest(loginValidationSchema),
  AuthControllers.login
);

router.post("/logout", AuthControllers.logout);

router.get("/me", auth(), AuthControllers.getMe);

export const AuthRoutes = router;
export default AuthRoutes;
