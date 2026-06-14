import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ProfileControllers } from "./profile.controller";
import { auth } from "../../middleware/auth";

const router = Router();

// Ensure the local uploads target folder exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage setup for local document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
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
