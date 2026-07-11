import { Router } from "express";
import { EmployerControllers } from "./employer.controller";

const router = Router();

router.get("/", EmployerControllers.getAllEmployers);

export const EmployerRoutes = router;
export default EmployerRoutes;
