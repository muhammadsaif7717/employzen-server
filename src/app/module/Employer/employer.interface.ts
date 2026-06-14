import { Types } from "mongoose";

export interface IEmployer {
  user: Types.ObjectId;
  name: string;
  company?: Types.ObjectId;
  avatarUrl?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
