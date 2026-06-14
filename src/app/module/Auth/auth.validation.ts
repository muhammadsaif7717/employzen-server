import { z } from "zod";

export const registerValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["candidate", "employer", "admin"]),
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    title: z.string().optional(), // For Candidate (e.g. "Software Developer")
    companyName: z.string().optional(), // For Employer
  }).refine(
    (data) => {
      if (data.role === "employer" && !data.companyName) {
        return false;
      }
      return true;
    },
    {
      message: "Company name is required for Employer registration",
      path: ["companyName"],
    }
  ),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
