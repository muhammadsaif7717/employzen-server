import { Types } from "mongoose";

export type TJobType = "Full-time" | "Part-time" | "Contract" | "Remote" | "Internship";
export type TJobStatus = "Pending" | "Approved" | "Rejected";

export interface IJob {
  title: string;
  description: string;
  company: Types.ObjectId;
  postedBy: Types.ObjectId;
  skillsRequired: string[];
  salaryRange: string;
  location: string;
  jobType: TJobType;
  status: TJobStatus;
  category: Types.ObjectId;
  views: number;
  applicationsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
