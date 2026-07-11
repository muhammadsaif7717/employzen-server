import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import EmployerModel from "./employer.model";

const getAllEmployers = catchAsync(async (req: Request, res: Response) => {
  const employers = await EmployerModel.find()
    .populate("user", "email status")
    .populate("company")
    .sort({ createdAt: -1 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employers fetched successfully",
    data: employers,
  });
});

export const EmployerControllers = {
  getAllEmployers,
};
