import { INotification } from "./notification.interface";
import NotificationModel from "./notification.model";

const createNotificationInDb = async (payload: INotification) => {
  const result = await NotificationModel.create(payload);
  return result;
};

const getUserNotificationsFromDb = async (userId: string) => {
  const result = await NotificationModel.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50);
  return result;
};

const markNotificationAsReadInDb = async (notificationId: string, userId: string) => {
  const result = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  return result;
};

const markAllNotificationsAsReadInDb = async (userId: string) => {
  const result = await NotificationModel.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return result;
};

export const NotificationServices = {
  createNotificationInDb,
  getUserNotificationsFromDb,
  markNotificationAsReadInDb,
  markAllNotificationsAsReadInDb,
};
