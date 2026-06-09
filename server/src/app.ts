import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./utils/logger";
import { connectDB } from "./config/db";
import { seedDatabase } from "./utils/seed";
import { startScheduler } from "./services/scheduler";
import { apiRateLimiter, sanitizeMongoInput } from "./middleware/security";
import { globalErrorHandler, notFoundHandler } from "./middleware/error";
import { getEnv, isProduction, validateProductionEnv } from "./config/env";

validateProductionEnv();
const app: Express = express();
const configuredOrigins = [getEnv("CLIENT_URL"), getEnv("CORS_ORIGIN")]
  .filter(Boolean)
  .flatMap(value => value!.split(","))
  .map(origin => origin.trim())
  .filter(Boolean);
const corsOrigins = isProduction()
  ? configuredOrigins
  : Array.from(new Set([...configuredOrigins, "http://localhost:5173", "http://127.0.0.1:5173"]));

app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
}));
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", ...corsOrigins],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
    },
  },
  referrerPolicy: { policy: "no-referrer" },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  maxAge: 86400,
}));
app.use(apiRateLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(sanitizeMongoInput);
app.use("/api", router);
app.use("/api", notFoundHandler);
app.use(globalErrorHandler);

connectDB()
  .then(() => seedDatabase())
  .then(() => startScheduler())
  .catch(err => logger.error({ err }, "DB init error"));

export default app;
