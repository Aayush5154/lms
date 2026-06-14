import app from "./app";
import { logger } from "./utils/logger";
import { isProduction, getEnv } from "./config/env";

const port = Number(process.env["PORT"]) || 5000;

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // ─── Self-ping keep-alive (production only) ────────────────────────
  // Render free tier spins down after 15 min of inactivity. This
  // pings the health endpoint every 14 min to keep the service warm.
  if (isProduction()) {
    const clientUrl = getEnv("CLIENT_URL");
    if (clientUrl) {
      const healthUrl = clientUrl.replace(/\/+$/, "") + "/api/healthz";
      const KEEP_ALIVE_MS = 14 * 60 * 1000; // 14 minutes

      setInterval(async () => {
        try {
          const res = await fetch(healthUrl, { signal: AbortSignal.timeout(10_000) });
          logger.info({ status: res.status }, "Keep-alive ping");
        } catch (err) {
          logger.warn({ err }, "Keep-alive ping failed");
        }
      }, KEEP_ALIVE_MS);

      logger.info({ healthUrl, intervalMin: 14 }, "Keep-alive self-ping enabled");
    }
  }
});
