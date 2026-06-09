import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import mongoose from "mongoose";
import { sendError } from "./error";
import { requireEnv } from "../config/env";

function getJwtSecret(): string {
  return requireEnv("JWT_SECRET");
}

const allowedRoles = new Set(["super_admin", "library_admin"]);

export interface AuthRequest extends Request {
  adminId?: string;
  adminRole?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] }) as { adminId?: string; role?: string };
    if (!decoded.adminId || !mongoose.Types.ObjectId.isValid(decoded.adminId) || !decoded.role || !allowedRoles.has(decoded.role)) {
      sendError(res, 401, "Invalid token", "INVALID_TOKEN");
      return;
    }
    req.adminId = decoded.adminId;
    req.adminRole = decoded.role;
    next();
  } catch {
    sendError(res, 401, "Invalid token", "INVALID_TOKEN");
  }
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.adminRole !== "super_admin") {
      sendError(res, 403, "Super admin access required", "FORBIDDEN");
      return;
    }
    next();
  });
}

export function signToken(adminId: string, role: string): string {
  return jwt.sign({ adminId, role }, getJwtSecret(), { algorithm: "HS256", expiresIn: "30d" });
}
