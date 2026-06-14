import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
    errorSources: [
      {
        path: req.originalUrl,
        message: "API Route Not Found",
      },
    ],
  });
};
