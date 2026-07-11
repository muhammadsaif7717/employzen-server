import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import CategoryModel from "./category.model";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await CategoryModel.find();

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Categories fetched successfully",
    data: categories,
  });
});

export const CategoryControllers = {
  getAllCategories,
};
