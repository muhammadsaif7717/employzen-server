import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { TErrorSources } from "../interfaces/error.types";
import { AppError } from "../errorHelpers/AppError";
import { handleValidationError } from "../errorHelpers/handleValidationError";
import { handleCastError } from "../errorHelpers/handleCastError";
import { handleDuplicateError } from "../errorHelpers/handleDuplicateError";

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Set default values
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSources = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => {
      return {
        path: issue.path[issue.path.length - 1] || "",
        message: issue.message,
      };
    });
  } else if (err?.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: env.nodeEnv === "development" ? err?.stack : null,
  });
};
