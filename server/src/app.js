import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./utils/logger.js";
import { setDbReady } from "./config/readiness.js";
import { connectDB } from "./config/db.js";
import { seedDatabase } from "./utils/seed.js";
import { startScheduler } from "./services/scheduler.js";
import { apiRateLimiter, sanitizeMongoInput } from "./middleware/security.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.js";
import { getEnv, isProduction, validateProductionEnv } from "./config/env.js";

validateProductionEnv();
const app = express();
const configuredOrigins = [getEnv("CLIENT_URL"), getEnv("CORS_ORIGIN")]
  .filter(Boolean)
  .flatMap(value => value.split(","))
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

if (isProduction()) {
  const clientDist = path.resolve(process.cwd(), "../client/dist/public");
  app.use(express.static(clientDist, { maxAge: "1y", immutable: true }));
}

app.use("/api", router);
app.use("/api", notFoundHandler);

if (isProduction()) {
  const clientDist = path.resolve(process.cwd(), "../client/dist/public");
  app.get("/{*path}", (req, res) => {
    res.sendFile(path.resolve(clientDist, "index.html"));
  });
}

app.use(globalErrorHandler);

async function initializeBackend() {
  try {
    await connectDB();
    setDbReady(true);
    await seedDatabase();
    startScheduler();
    logger.info("Backend fully initialized");
  } catch (err) {
    logger.error({ err }, "Fatal: database initialization failed — shutting down");
    process.exit(1);
  }
}

initializeBackend();

export default app;
