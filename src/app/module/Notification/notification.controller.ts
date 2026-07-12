import { Request, Response } from "express";
import { NotificationServices } from "./notification.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await NotificationServices.getUserNotificationsFromDb(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications fetched successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const result = await NotificationServices.markNotificationAsReadInDb(id as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read successfully",
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await NotificationServices.markAllNotificationsAsReadInDb(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications marked as read successfully",
    data: result,
  });
});

const deleteAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await NotificationServices.deleteAllNotificationsInDb(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications deleted successfully",
    data: result,
  });
});

export const NotificationControllers = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteAllNotifications,
};
