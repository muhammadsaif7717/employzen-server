import { Request, Response } from "express";
import { AuthServices } from "./auth.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { env } from "../../config/env";
import UserModel from "../User/user.model";
import CandidateModel from "../Candidate/candidate.model";
import EmployerModel from "../Employer/employer.model";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);
  const { user, profile, accessToken, refreshToken } = result;

  // Set refresh token and access token in HTTP-only cookies
  const cookieOptions = {
    secure: env.nodeEnv === "production",
    httpOnly: true,
    sameSite: (env.nodeEnv === "production" ? "none" : "lax") as "none" | "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: 201, // 201 Created
    success: true,
    message: "User registered successfully",
    data: { user, profile },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  const { user, profile, accessToken, refreshToken } = result;

  const cookieOptions = {
    secure: env.nodeEnv === "production",
    httpOnly: true,
    sameSite: (env.nodeEnv === "production" ? "none" : "lax") as "none" | "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "User logged in successfully",
    data: { user, profile },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const cookieOptions = {
    secure: env.nodeEnv === "production",
    httpOnly: true,
    sameSite: (env.nodeEnv === "production" ? "none" : "lax") as "none" | "lax",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

// Verify session and get active user profile details
const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const user = await UserModel.findById(userId);

  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  let profileData: any = null;
  if (user.role === "candidate") {
    profileData = await CandidateModel.findOne({ user: user._id });
  } else if (user.role === "employer") {
    profileData = await EmployerModel.findOne({ user: user._id }).populate("company");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile fetched successfully",
    data: {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
      profile: profileData,
    },
  });
});

export const AuthControllers = {
  register,
  login,
  logout,
  getMe,
};
