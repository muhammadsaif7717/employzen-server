import { Request, Response } from "express";
import { ChatServices } from "./chat.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getMessageHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { partnerId } = req.params;
  const result = await ChatServices.getMessageHistoryFromDb(userId!, partnerId as string);

  sendResponse(res, {
    statusCode: 20, // 200 OK
    success: true,
    message: "Chat history loaded successfully",
    data: result,
  });
});

const getChatRooms = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ChatServices.getChatRoomsFromDb(userId!);

  sendResponse(res, {
    statusCode: 20, // 200 OK
    success: true,
    message: "Conversation rooms loaded successfully",
    data: result,
  });
});

export const ChatControllers = {
  getMessageHistory,
  getChatRooms,
};
