import { Request, Response } from "express";
import { ProfileServices } from "./profile.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AppError } from "../../errorHelpers/AppError";

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const result = await ProfileServices.getProfileFromDb(userId!, role!);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const result = await ProfileServices.updateProfileInDb(userId!, role!, req.body);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const uploadResume = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, "Please upload a valid PDF or Word document");
  }

  // The file is now hosted on Cloudinary, so req.file.path contains the URL directly
  const fileUrl = req.file.path;

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Resume uploaded successfully",
    data: {
      resumeUrl: fileUrl,
    },
  });
});

export const ProfileControllers = {
  getProfile,
  updateProfile,
  uploadResume,
};
