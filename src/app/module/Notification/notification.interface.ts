import { Types } from "mongoose";

export interface INotification {
  recipient: Types.ObjectId;
  message: string;
  type: "LOGIN" | "CHAT" | "APPLICATION" | "JOB_POST" | "JOB_STATUS" | "PROFILE" | "SYSTEM" | string;
  link: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
