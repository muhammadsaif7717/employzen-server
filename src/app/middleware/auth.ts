import { NextFunction, Request, Response } from "express";
import { AppError } from "../errorHelpers/AppError";
import { catchAsync } from "../shared/catchAsync";
import { verifyToken } from "../utils/jwt";
import { env } from "../config/env";
import UserModel from "../module/User/user.model";

// TypeScript global declaration extension for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: "candidate" | "employer" | "admin";
        name: string;
      };
    }
  }
}

export const auth = (...requiredRoles: ("candidate" | "employer" | "admin")[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Read token from cookies or authorization header
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError(401, "You are not authorized to access this resource");
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyToken(token, env.jwtSecret) as {
        userId: string;
        email: string;
        role: "candidate" | "employer" | "admin";
        name: string;
      };
    } catch (error) {
      throw new AppError(401, "Token has expired or is invalid");
    }

    const { userId, role } = decoded;

    // 3. Verify user exists and status in database
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(404, "User associated with this token does not exist");
    }

    if (user.status === "blocked") {
      throw new AppError(403, "This user account has been blocked");
    }

    // 4. Verify role permissions
    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(403, "You do not have permission to access this resource");
    }

    // 5. Append decoded user metadata to Request context
    req.user = decoded;
    next();
  });
};
