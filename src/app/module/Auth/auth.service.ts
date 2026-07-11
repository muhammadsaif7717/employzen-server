import UserModel from "../User/user.model";
import CandidateModel from "../Candidate/candidate.model";
import EmployerModel from "../Employer/employer.model";
import CompanyModel from "../Company/company.model";
import { AppError } from "../../errorHelpers/AppError";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { env } from "../../config/env";

const registerUser = async (payload: any) => {
  const { email, password, role, name, phone, title, companyName } = payload;

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError(400, "User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create User
  const newUser = await UserModel.create({
    email,
    password: hashedPassword,
    role,
    name,
    phone,
  });

  let profileData: any = null;

  if (role === "candidate") {
    profileData = await CandidateModel.create({
      user: newUser._id,
      name,
      phone,
      title,
    });
  } else if (role === "employer") {
    // 1. Create company
    const newCompany = await CompanyModel.create({
      name: companyName,
      jobs: [],
    });

    // 2. Create employer profile
    profileData = await EmployerModel.create({
      user: newUser._id,
      name,
      phone,
      company: newCompany._id,
    });
  }

  // Generate tokens
  const jwtPayload = {
    userId: newUser._id,
    email: newUser.email,
    role: newUser.role,
    name: profileData?.name || name,
  };

  const accessToken = generateToken(
    jwtPayload,
    env.jwtSecret,
    "1d" // Access token valid for 1 day
  );

  const refreshToken = generateToken(
    jwtPayload,
    env.jwtRefreshSecret,
    "7d" // Refresh token valid for 7 days
  );

  return {
    user: {
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    },
    profile: profileData,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: any) => {
  const { email, password } = payload;

  // Check if user exists (include select password)
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status === "blocked") {
    throw new AppError(403, "Your account has been blocked by the Administrator");
  }

  // Compare password
  const isPasswordMatched = await comparePassword(password, user.password || "");
  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  // Fetch role-specific details to append to JWT/response
  let profileName = "User";
  let profileData: any = null;

  if (user.role === "candidate") {
    profileData = await CandidateModel.findOne({ user: user._id });
    profileName = profileData?.name || "Candidate";
  } else if (user.role === "employer") {
    profileData = await EmployerModel.findOne({ user: user._id }).populate("company");
    profileName = profileData?.name || "Employer";
  } else if (user.role === "admin") {
    profileName = "Administrator";
  }

  // Generate tokens
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: profileName,
  };

  const accessToken = generateToken(
    jwtPayload,
    env.jwtSecret,
    "1d"
  );

  const refreshToken = generateToken(
    jwtPayload,
    env.jwtRefreshSecret,
    "7d"
  );

  // Create login notification
  try {
    const { NotificationServices } = require("../Notification/notification.service");
    const { io } = require("../../../server");
    const notification = await NotificationServices.createNotificationInDb({
      recipient: user._id,
      message: "Login successful",
      type: "LOGIN",
      link: "/profile",
    });
    io.to(user._id.toString()).emit("new_notification", notification);
  } catch (error) {
    console.error("Login notification error:", error);
  }

  return {
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    profile: profileData,
    accessToken,
    refreshToken,
  };
};

export const AuthServices = {
  registerUser,
  loginUser,
};
