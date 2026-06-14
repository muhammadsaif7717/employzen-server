import { z } from "zod";

export const createJobValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Job title is required"),
    description: z.string().min(1, "Job description is required"),
    skillsRequired: z.array(z.string()).default([]),
    salaryRange: z.string().min(1, "Salary range is required"),
    location: z.string().min(1, "Location is required"),
    jobType: z.enum(["Full-time", "Part-time", "Contract", "Remote", "Internship"]),
    category: z.string().min(1, "Category ID is required"),
  }),
});

export const updateJobStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["Pending", "Approved", "Rejected"]),
  }),
});
