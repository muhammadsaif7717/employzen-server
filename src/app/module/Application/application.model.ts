import { Schema, model } from "mongoose";
import { IApplication } from "./application.interface";

const applicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Interviewing", "Hired", "Rejected"],
      default: "Applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Unique combination of candidate and job to prevent multiple applications to same job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export const ApplicationModel = model<IApplication>("Application", applicationSchema);
export default ApplicationModel;
