import rateLimit from "express-rate-limit";

function sanitizeValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (!value || typeof value !== "object") return value;
  const sanitized = {};
  for (const [key, child] of Object.entries(value)) {
    const safeKey = key.replace(/^\$+/, "").replace(/\./g, "_");
    if (!safeKey) continue;
    sanitized[safeKey] = sanitizeValue(child);
  }
  return sanitized;
}

function replaceRequestValue(req, key, value) {
  Object.defineProperty(req, key, {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
}

export function sanitizeMongoInput(req, _res, next) {
  replaceRequestValue(req, "body", sanitizeValue(req.body));
  replaceRequestValue(req, "query", sanitizeValue(req.query));
  replaceRequestValue(req, "params", sanitizeValue(req.params));
  next();
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env["RATE_LIMIT_MAX"] ?? 300),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests", code: "RATE_LIMITED" },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env["AUTH_RATE_LIMIT_MAX"] ?? 20),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: "Too many login attempts", code: "AUTH_RATE_LIMITED" },
});
