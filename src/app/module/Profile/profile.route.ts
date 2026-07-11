import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ProfileControllers } from "./profile.controller";
import { auth } from "../../middleware/auth";

const router = Router();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { env } from "../../config/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName || "",
  api_key: env.cloudinary.apiKey || "",
  api_secret: env.cloudinary.apiSecret || "",
});

// Cloudinary storage setup for document uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "resumes",
      resource_type: "raw", // Needed for PDFs and DOCX files
      format: path.extname(file.originalname).substring(1), // Optional: specify format
      public_id: file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9),
    };
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf" && ext !== ".doc" && ext !== ".docx") {
      return cb(new Error("Only PDF or Word documents (.doc/.docx) are allowed") as any, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});
router.get("/", auth(), ProfileControllers.getProfile);

router.patch("/", auth(), ProfileControllers.updateProfile);

router.post(
  "/resume",
  auth("candidate"),
  upload.single("resume"),
  ProfileControllers.uploadResume
);

export const ProfileRoutes = router;
export default ProfileRoutes;
