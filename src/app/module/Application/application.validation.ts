import { z } from "zod";

export const applyJobValidationSchema = z.object({
  body: z.object({
    job: z.string().min(1, "Job ID is required"),
    resumeUrl: z.string().min(1, "Resume URL is required"),
  }),
});

export const updateApplicationStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["Applied", "Shortlisted", "Interviewing", "Hired", "Rejected"]),
  }),
});
