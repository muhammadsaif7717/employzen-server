import UserModel from "./user.model";
import CandidateModel from "../Candidate/candidate.model";
import EmployerModel from "../Employer/employer.model";
import CompanyModel from "../Company/company.model";
import { AppError } from "../../errorHelpers/AppError";

const getAllUsersFromDb = async () => {
  const users = await UserModel.find().sort({ createdAt: -1 });
  const usersWithProfile = await Promise.all(
    users.map(async (user) => {
      let profile: any = null;
      if (user.role === "candidate") {
        profile = await CandidateModel.findOne({ user: user._id });
      } else if (user.role === "employer") {
        profile = await EmployerModel.findOne({ user: user._id }).populate("company");
      }
      return {
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: (user as any).createdAt,
        profile,
      };
    })
  );
  return usersWithProfile;
};

const updateUserStatusInDb = async (userId: string, status: "active" | "blocked") => {
  const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Notify User
  try {
    const { NotificationServices } = require("../Notification/notification.service");
    const { io } = require("../../../server");
    const notification = await NotificationServices.createNotificationInDb({
      recipient: userId,
      message: `Your account has been ${status}`,
      type: "SYSTEM",
      link: "/",
    });
    io.to(userId.toString()).emit("new_notification", notification);
  } catch (error) {
    console.error("User status notification error:", error);
  }

  return user;
};

const deleteUserFromDb = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Delete associated profiles
  if (user.role === "candidate") {
    await CandidateModel.findOneAndDelete({ user: userId });
  } else if (user.role === "employer") {
    const employer = await EmployerModel.findOne({ user: userId });
    if (employer) {
      if (employer.company) {
        await CompanyModel.findByIdAndDelete(employer.company);
      }
      await EmployerModel.findByIdAndDelete(employer._id);
    }
  }

  await UserModel.findByIdAndDelete(userId);
  return { id: userId };
};

export const UserServices = {
  getAllUsersFromDb,
  updateUserStatusInDb,
  deleteUserFromDb,
};
