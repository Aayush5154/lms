import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = "API_ERROR", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function sendError(res: Response, statusCode: number, message: string, code = "API_ERROR", details?: unknown): void {
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(details === undefined ? {} : { details }),
  });
}

export function asyncHandler<TReq extends Request = Request>(
  handler: (req: TReq, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: TReq, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 404, "Route not found", "NOT_FOUND", { path: req.originalUrl });
};

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const code = err instanceof ApiError ? err.code : "INTERNAL_ERROR";
  const message = err instanceof ApiError ? err.message : "Internal server error";

  req.log?.error({ err, statusCode, code }, "Request failed");
  if (!req.log) logger.error({ err, statusCode, code }, "Request failed");

  sendError(res, statusCode, message, code, err instanceof ApiError ? err.details : undefined);
};
