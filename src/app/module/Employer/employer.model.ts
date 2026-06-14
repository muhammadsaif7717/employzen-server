import { Schema, model } from "mongoose";
import { IEmployer } from "./employer.interface";

const employerSchema = new Schema<IEmployer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    avatarUrl: { type: String },
    phone: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const EmployerModel = model<IEmployer>("Employer", employerSchema);
export default EmployerModel;
