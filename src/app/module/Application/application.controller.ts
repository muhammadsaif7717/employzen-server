import { Request, Response } from "express";
import { ApplicationServices } from "./application.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const applyJob = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ApplicationServices.applyJobIntoDb(userId!, req.body);

  sendResponse(res, {
    statusCode: 201, // 201 Created
    success: true,
    message: "Application submitted successfully",
    data: result,
  });
});

const getCandidateApplications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ApplicationServices.getCandidateApplicationsFromDb(userId!);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Applications fetched successfully",
    data: result,
  });
});

const getJobApplicants = catchAsync(async (req: Request, res: Response) => {
  const employerUserId = req.user?.userId;
  const { jobId } = req.params;
  const result = await ApplicationServices.getJobApplicantsFromDb(employerUserId!, jobId as string);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Job applicants fetched successfully",
    data: result,
  });
});

const updateApplicationStatus = catchAsync(async (req: Request, res: Response) => {
  const employerUserId = req.user?.userId;
  const { id } = req.params;
  const { status } = req.body;
  const result = await ApplicationServices.updateApplicationStatusInDb(employerUserId!, id as string, status);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: `Application status updated to ${status} successfully`,
    data: result,
  });
});

export const ApplicationControllers = {
  applyJob,
  getCandidateApplications,
  getJobApplicants,
  updateApplicationStatus,
};
