import { Types } from "mongoose";

export type TApplicationStatus = "Applied" | "Shortlisted" | "Interviewing" | "Hired" | "Rejected";

export interface IApplication {
  job: Types.ObjectId;
  candidate: Types.ObjectId;
  resumeUrl: string;
  status: TApplicationStatus;
  appliedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
