import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { isPersistentDB } from "../config/db";
import { isDbReady } from "../config/readiness";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const ready = isDbReady();
  const data = HealthCheckResponse.parse({ status: ready ? "ok" : "starting" });
  res.status(ready ? 200 : 503).json({ ...data, persistent: isPersistentDB(), dbReady: ready });
});

export default router;
