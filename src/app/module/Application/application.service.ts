import { Types } from "mongoose";
import ApplicationModel from "./application.model";
import CandidateModel from "../Candidate/candidate.model";
import JobModel from "../Job/job.model";
import EmployerModel from "../Employer/employer.model";
import { AppError } from "../../errorHelpers/AppError";

const applyJobIntoDb = async (userId: string, payload: any) => {
  const { job: jobId, resumeUrl } = payload;

  // 1. Find Candidate
  const candidate = await CandidateModel.findOne({ user: userId });
  if (!candidate) {
    throw new AppError(404, "Candidate profile not found");
  }

  // 2. Find Job
  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new AppError(404, "Job listing not found");
  }

  if (job.status !== "Approved") {
    throw new AppError(400, "This job is not active or approved for applications");
  }

  // 3. Prevent duplicate applications
  const existingApplication = await ApplicationModel.findOne({
    job: jobId,
    candidate: candidate._id,
  });

  if (existingApplication) {
    throw new AppError(400, "You have already applied for this job");
  }

  // 4. Create Application
  const application = await ApplicationModel.create({
    job: jobId,
    candidate: candidate._id,
    resumeUrl,
    status: "Applied",
  });

  // 5. Update Job applications counter
  await JobModel.findByIdAndUpdate(jobId, {
    $inc: { applicationsCount: 1 },
  });

  // 6. Send Notifications
  try {
    const { NotificationServices } = require("../Notification/notification.service");
    const { io } = require("../../../server");
    const populatedJob = await JobModel.findById(jobId).populate("postedBy");
    const employerUserId = (populatedJob?.postedBy as any)?.user;

    // Notify Candidate
    const candidateNotification = await NotificationServices.createNotificationInDb({
      recipient: userId,
      message: `Your application for ${job.title} was sent successfully`,
      type: "APPLICATION",
      link: "/dashboard",
    });
    io.to(userId.toString()).emit("new_notification", candidateNotification);

    // Notify Employer
    if (employerUserId) {
      const employerNotification = await NotificationServices.createNotificationInDb({
        recipient: employerUserId,
        message: `New application received for ${job.title}`,
        type: "APPLICATION",
        link: "/dashboard",
      });
      io.to(employerUserId.toString()).emit("new_notification", employerNotification);
    }
  } catch (error) {
    console.error("Application notification error:", error);
  }

  return application;
};

const getCandidateApplicationsFromDb = async (userId: string) => {
  const candidate = await CandidateModel.findOne({ user: userId });
  if (!candidate) {
    throw new AppError(404, "Candidate profile not found");
  }

  return ApplicationModel.find({ candidate: candidate._id })
    .populate({
      path: "job",
      populate: [
        { path: "company" },
        { path: "postedBy" },
      ],
    })
    .sort({ createdAt: -1 });
};

const getJobApplicantsFromDb = async (employerUserId: string, jobId: string) => {
  const employer = await EmployerModel.findOne({ user: employerUserId });
  if (!employer) {
    throw new AppError(404, "Employer profile not found");
  }

  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new AppError(404, "Job listing not found");
  }

  // Ensure employer is the owner of the job post
  if (job.postedBy.toString() !== employer._id.toString()) {
    throw new AppError(403, "Access denied. You did not post this job listing");
  }

  return ApplicationModel.find({ job: jobId })
    .populate("candidate")
    .sort({ createdAt: -1 });
};

const updateApplicationStatusInDb = async (
  employerUserId: string,
  applicationId: string,
  status: "Applied" | "Shortlisted" | "Interviewing" | "Hired" | "Rejected"
) => {
  const employer = await EmployerModel.findOne({ user: employerUserId });
  if (!employer) {
    throw new AppError(404, "Employer profile not found");
  }

  const application = await ApplicationModel.findById(applicationId).populate("job").populate("candidate");
  if (!application) {
    throw new AppError(404, "Job application not found");
  }

  const job = application.job as any;
  if (!job) {
    throw new AppError(404, "Job listing for this application is missing");
  }

  // Ensure employer is the owner of the job post
  if (job.postedBy.toString() !== employer._id.toString()) {
    throw new AppError(403, "Access denied. You cannot manage applicants for this job");
  }

  application.status = status;
  await application.save();

  // Notify Candidate
  try {
    const candidateUserId = (application.candidate as any)?.user;
    if (candidateUserId) {
      const { NotificationServices } = require("../Notification/notification.service");
      const { io } = require("../../../server");
      const candidateNotification = await NotificationServices.createNotificationInDb({
        recipient: candidateUserId,
        message: `Your application for ${job.title} has been marked as ${status}`,
        type: "APPLICATION",
        link: "/candidate",
      });
      io.to(candidateUserId.toString()).emit("new_notification", candidateNotification);
    }
  } catch (error) {
    console.error("Application status notification error:", error);
  }

  return application;
};

export const ApplicationServices = {
  applyJobIntoDb,
  getCandidateApplicationsFromDb,
  getJobApplicantsFromDb,
  updateApplicationStatusInDb,
};
