import { logger } from "../utils/logger.js";

export function sendError(res, statusCode, message, code = "API_ERROR", details) {
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(details === undefined ? {} : { details }),
  });
}

export class ApiError extends Error {
  constructor(statusCode, message, code = "API_ERROR", details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export const notFoundHandler = (req, res) => {
  sendError(res, 404, "Route not found", "NOT_FOUND", { path: req.originalUrl });
};

export const globalErrorHandler = (err, req, res, _next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const code = err instanceof ApiError ? err.code : "INTERNAL_ERROR";
  const message = err instanceof ApiError ? err.message : "Internal server error";

  req.log?.error({ err, statusCode, code }, "Request failed");
  if (!req.log) logger.error({ err, statusCode, code }, "Request failed");

  sendError(res, statusCode, message, code, err instanceof ApiError ? err.details : undefined);
};
