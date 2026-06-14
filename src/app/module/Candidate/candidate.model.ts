import { Schema, model } from "mongoose";
import { ICandidate } from "./candidate.interface";

const experienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String },
  },
  { _id: false }
);

const educationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    year: { type: String, required: true },
  },
  { _id: false }
);

const cvProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
  },
  { _id: false }
);

const cvBuilderSchema = new Schema(
  {
    title: { type: String },
    phone: { type: String },
    summary: { type: String },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
    },
    projects: [cvProjectSchema],
    certifications: [String],
  },
  { _id: false }
);

const candidateSchema = new Schema<ICandidate>(
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
    avatarUrl: { type: String },
    phone: { type: String },
    title: { type: String },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    resumeUrl: { type: String },
    cvBuilderData: { type: cvBuilderSchema },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CandidateModel = model<ICandidate>("Candidate", candidateSchema);
export default CandidateModel;
