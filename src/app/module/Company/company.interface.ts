import { Types } from "mongoose";

export interface ICompany {
  name: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  jobs: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
