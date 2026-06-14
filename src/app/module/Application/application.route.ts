import { Router } from "express";
import { ApplicationControllers } from "./application.controller";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { applyJobValidationSchema, updateApplicationStatusValidationSchema } from "./application.validation";

const router = Router();

router.post(
  "/",
  auth("candidate"),
  validateRequest(applyJobValidationSchema),
  ApplicationControllers.applyJob
);

router.get(
  "/candidate",
  auth("candidate"),
  ApplicationControllers.getCandidateApplications
);

router.get(
  "/job/:jobId",
  auth("employer"),
  ApplicationControllers.getJobApplicants
);

router.patch(
  "/:id/status",
  auth("employer"),
  validateRequest(updateApplicationStatusValidationSchema),
  ApplicationControllers.updateApplicationStatus
);

export const ApplicationRoutes = router;
export default ApplicationRoutes;
