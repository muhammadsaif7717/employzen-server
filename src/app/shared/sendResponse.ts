import { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
};

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  let statusCode = data.statusCode;
  if (statusCode === 20) statusCode = 200;
  if (statusCode === 21) statusCode = 201;
  
  res.status(statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
  });
};
