import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateToken = (
  payload: Record<string, any>,
  secret: string,
  expiresIn: string | number
): string => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string, secret: string): Record<string, any> => {
  return jwt.verify(token, secret) as Record<string, any>;
};
