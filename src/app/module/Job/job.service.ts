import { Schema, Types } from "mongoose";
import JobModel from "./job.model";
import EmployerModel from "../Employer/employer.model";
import CompanyModel from "../Company/company.model";
import { AppError } from "../../errorHelpers/AppError";

const createJobIntoDb = async (userId: string, payload: any) => {
  // 1. Find the employer profile
  const employer = await EmployerModel.findOne({ user: userId });
  if (!employer) {
    throw new AppError(404, "Employer profile not found");
  }

  if (!employer.company) {
    throw new AppError(400, "Employer is not associated with a company profile yet");
  }

  // 2. Create the job listing (status defaults to Pending)
  const job = await JobModel.create({
    ...payload,
    company: employer.company,
    postedBy: employer._id,
    status: "Pending",
  });

  // 3. Add job to Company listings
  await CompanyModel.findByIdAndUpdate(employer.company, {
    $push: { jobs: job._id },
  });

  return job;
};

const getAllJobsFromDb = async (query: Record<string, any>) => {
  const { search, location, jobType, category, postedBy, status, page = 1, limit = 10 } = query;

  const filter: Record<string, any> = {};

  // Public search shows only Approved listings by default
  filter.status = status || "Approved";

  // Search by keyword in title (case-insensitive)
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  // Filter by location (case-insensitive)
  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }

  // Filter by jobType
  if (jobType) {
    filter.jobType = jobType;
  }

  // Filter by category ObjectId
  if (category) {
    filter.category = new Types.ObjectId(category);
  }

  // Filter by postedBy employer ID
  if (postedBy) {
    filter.postedBy = new Types.ObjectId(postedBy);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const jobsQuery = JobModel.find(filter)
    .populate("company")
    .populate({
      path: "postedBy",
      select: "name avatarUrl",
    })
    .populate("category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const jobs = await jobsQuery;
  const total = await JobModel.countDocuments(filter);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    result: jobs,
  };
};

const getJobByIdFromDb = async (jobId: string) => {
  // Update views counter of this job and fetch it
  const job = await JobModel.findByIdAndUpdate(
    jobId,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("company")
    .populate({
      path: "postedBy",
      select: "name avatarUrl email",
    })
    .populate("category");

  if (!job) {
    throw new AppError(404, "Job listing not found");
  }

  return job;
};

const updateJobStatusInDb = async (jobId: string, status: "Pending" | "Approved" | "Rejected") => {
  const job = await JobModel.findByIdAndUpdate(
    jobId,
    { status },
    { new: true }
  );

  if (!job) {
    throw new AppError(404, "Job listing not found");
  }

  return job;
};

const deleteJobFromDb = async (jobId: string) => {
  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new AppError(404, "Job listing not found");
  }

  // 1. Remove job from Company listings
  if (job.company) {
    await CompanyModel.findByIdAndUpdate(job.company, {
      $pull: { jobs: job._id },
    });
  }

  // 2. Cascade delete associated applications
  const mongoose = require("mongoose");
  try {
    const ApplicationModel = mongoose.model("Application");
    if (ApplicationModel) {
      await ApplicationModel.deleteMany({ job: job._id });
    }
  } catch (err) {
    console.error("Failed to delete associated applications:", err);
  }

  // 3. Delete the job listing
  await JobModel.findByIdAndDelete(jobId);

  return { id: jobId };
};

export const JobServices = {
  createJobIntoDb,
  getAllJobsFromDb,
  getJobByIdFromDb,
  updateJobStatusInDb,
  deleteJobFromDb,
};
