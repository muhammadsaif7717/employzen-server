import { Request, Response } from "express";
import { UserServices } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsersFromDb();

  sendResponse(res, {
    statusCode: 20, // 200 OK
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await UserServices.updateUserStatusInDb(id as string, status);

  sendResponse(res, {
    statusCode: 20, // 200 OK
    success: true,
    message: `User account has been ${status === "blocked" ? "blocked" : "activated"} successfully`,
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.deleteUserFromDb(id as string);

  sendResponse(res, {
    statusCode: 20, // 200 OK
    success: true,
    message: "User and associated profiles deleted successfully",
    data: result,
  });
});

export const UserControllers = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
};
