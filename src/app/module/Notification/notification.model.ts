import { Schema, model } from "mongoose";
import { INotification } from "./notification.interface";

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["LOGIN", "CHAT", "APPLICATION", "JOB_POST", "JOB_STATUS", "PROFILE", "SYSTEM"],
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const NotificationModel = model<INotification>("Notification", notificationSchema);
export default NotificationModel;
