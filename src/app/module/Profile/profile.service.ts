import CandidateModel from "../Candidate/candidate.model";
import EmployerModel from "../Employer/employer.model";
import CompanyModel from "../Company/company.model";
import UserModel from "../User/user.model";
import { AppError } from "../../errorHelpers/AppError";

const getProfileFromDb = async (userId: string, role: string) => {
  if (role === "candidate") {
    const candidate = await CandidateModel.findOne({ user: userId });
    if (!candidate) {
      throw new AppError(404, "Candidate profile not found");
    }
    const user = await UserModel.findById(userId);
    return {
      ...candidate.toObject(),
      email: user?.email,
    };
  } else if (role === "employer") {
    const employer = await EmployerModel.findOne({ user: userId }).populate("company");
    if (!employer) {
      throw new AppError(404, "Employer profile not found");
    }
    const user = await UserModel.findById(userId);
    return {
      ...employer.toObject(),
      email: user?.email,
    };
  } else if (role === "admin") {
    const user = await UserModel.findById(userId);
    return {
      _id: userId,
      email: user?.email,
      role: "admin",
      name: user?.name || "Administrator",
      phone: user?.phone || "",
      avatarUrl: user?.avatarUrl || "",
    };
  }
  throw new AppError(400, "Invalid user role");
};

const updateProfileInDb = async (userId: string, role: string, payload: any) => {
  const { email, password, ...restPayload } = payload;

  // 1. If email or password is provided, update the User document
  if (email || password) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (email) {
      // Check if email is already taken by another user
      const existingUser = await UserModel.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new AppError(400, "User with this email already exists");
      }
      user.email = email;
    }

    if (password) {
      const { hashPassword } = require("../../utils/hash");
      user.password = await hashPassword(password);
    }

    await user.save();
  }

  let updatedProfile: any;

  // 2. Update role-specific profile details
  if (role === "candidate") {
    const candidate = await CandidateModel.findOneAndUpdate(
      { user: userId },
      { $set: restPayload },
      { new: true, runValidators: true }
    );
    if (!candidate) {
      throw new AppError(404, "Candidate profile not found");
    }

    const user = await UserModel.findById(userId);
    updatedProfile = {
      ...candidate.toObject(),
      email: user?.email,
    };
  } else if (role === "employer") {
    const { name, phone, avatarUrl, companyName, website, location, description, industry } = restPayload;

    // Find Employer
    const employer = await EmployerModel.findOne({ user: userId });
    if (!employer) {
      throw new AppError(404, "Employer profile not found");
    }

    // Update Employer basic details
    if (name) employer.name = name;
    if (phone) employer.phone = phone;
    if (avatarUrl) employer.avatarUrl = avatarUrl;
    await employer.save();

    // Update Company profile if company exists and details are provided
    if (employer.company && (companyName || website || location || description || industry)) {
      const companyPayload: any = {};
      if (companyName) companyPayload.name = companyName;
      if (website) companyPayload.website = website;
      if (location) companyPayload.location = location;
      if (description) companyPayload.description = description;
      if (industry) companyPayload.industry = industry;

      await CompanyModel.findByIdAndUpdate(employer.company, {
        $set: companyPayload,
      });
    }

    const updatedEmployer = await EmployerModel.findOne({ user: userId }).populate("company");
    const user = await UserModel.findById(userId);
    updatedProfile = {
      ...updatedEmployer!.toObject(),
      email: user?.email,
    };
  } else if (role === "admin") {
    const { name, phone, avatarUrl } = restPayload;
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    await user.save();

    updatedProfile = {
      _id: userId,
      email: user.email,
      role: "admin",
      name: user.name || "Administrator",
      phone: user.phone || "",
      avatarUrl: user.avatarUrl || "",
    };
  } else {
    throw new AppError(400, "Profile updates not supported for this role");
  }

  // Send Notification
  try {
    const { NotificationServices } = require("../Notification/notification.service");
    const { io } = require("../../../server");
    const notification = await NotificationServices.createNotificationInDb({
      recipient: userId,
      message: "Profile updated successfully",
      type: "PROFILE",
      link: "/profile",
    });
    io.to(userId.toString()).emit("new_notification", notification);
  } catch (error) {
    console.error("Profile update notification error:", error);
  }

  return updatedProfile;
};

export const ProfileServices = {
  getProfileFromDb,
  updateProfileInDb,
};
