import { Router } from "express";
import { JobControllers } from "./job.controller";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { createJobValidationSchema, updateJobStatusValidationSchema } from "./job.validation";

const router = Router();

router.post(
  "/",
  auth("employer"),
  validateRequest(createJobValidationSchema),
  JobControllers.createJob
);

router.get("/", JobControllers.getAllJobs);

router.get("/:id", JobControllers.getJobById);

router.patch(
  "/:id/status",
  auth("admin"),
  validateRequest(updateJobStatusValidationSchema),
  JobControllers.updateJobStatus
);

router.delete(
  "/:id",
  auth("admin"),
  JobControllers.deleteJob
);

export const JobRoutes = router;
export default JobRoutes;
