import { Schema, model } from "mongoose";
import { ICompany } from "./company.interface";

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: { type: String },
    description: { type: String },
    website: { type: String },
    location: { type: String },
    industry: { type: String },
    jobs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CompanyModel = model<ICompany>("Company", companySchema);
export default CompanyModel;
