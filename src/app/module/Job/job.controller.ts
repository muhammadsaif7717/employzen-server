import { Request, Response } from "express";
import { JobServices } from "./job.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createJob = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await JobServices.createJobIntoDb(userId!, req.body);

  sendResponse(res, {
    statusCode: 201, // 201 Created
    success: true,
    message: "Job listing created successfully (Pending Admin Approval)",
    data: result,
  });
});

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getAllJobsFromDb(req.query);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Job listings fetched successfully",
    data: result,
  });
});

const getJobById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobServices.getJobByIdFromDb(id as string);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Job details fetched successfully",
    data: result,
  });
});

const updateJobStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await JobServices.updateJobStatusInDb(id as string, status);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: `Job status updated to ${status} successfully`,
    data: result,
  });
});

const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobServices.deleteJobFromDb(id as string);

  sendResponse(res, {
    statusCode: 200, // 200 OK
    success: true,
    message: "Job listing deleted successfully",
    data: result,
  });
});

export const JobControllers = {
  createJob,
  getAllJobs,
  getJobById,
  updateJobStatus,
  deleteJob,
};
