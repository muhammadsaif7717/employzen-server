import { Types } from "mongoose";

export interface IExperience {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  year: string;
}

export interface ICVBuilderData {
  title?: string;
  phone?: string;
  summary?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  projects?: {
    name: string;
    description: string;
    link?: string;
  }[];
  certifications?: string[];
}

export interface ICandidate {
  user: Types.ObjectId;
  name: string;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  skills: string[];
  experience: IExperience[];
  education: IEducation[];
  resumeUrl?: string;
  cvBuilderData?: ICVBuilderData;
  createdAt?: Date;
  updatedAt?: Date;
}
