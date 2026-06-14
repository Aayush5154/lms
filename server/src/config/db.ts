import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { getEnv, isProduction } from "./env";

let isConnected = false;
/** Tracks whether the current connection is to a real (persistent) database */
let usingPersistentDB = false;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = getEnv("MONGODB_URI");

  if (!uri) {
    // In production, MONGODB_URI is mandatory (validated by validateProductionEnv).
    // In development, allow MongoMemoryServer as an explicit opt-in ONLY when
    // MONGODB_URI is completely absent — never as a silent fallback.
    if (isProduction()) {
      throw new Error("MONGODB_URI must be configured in production");
    }

    logger.warn("⚠️  MONGODB_URI not set. Starting in-memory MongoDB for local dev.");
    logger.warn("⚠️  Data will NOT persist across server restarts.");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const memServer = await MongoMemoryServer.create();
    await mongoose.connect(memServer.getUri(), { dbName: "library_lms" });
    isConnected = true;
    usingPersistentDB = false;
    logger.info("MongoDB connected: In-Memory (no MONGODB_URI configured)");
    return;
  }

  // MONGODB_URI is set — connect to the real database with retries.
  // Never fall back to in-memory when a URI is configured.
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        dbName: "library_lms",
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
      });
      isConnected = true;
      usingPersistentDB = true;
      logger.info("MongoDB connected: Cloud (Atlas)");
      return;
    } catch (err) {
      logger.error(
        { err, attempt, maxRetries: MAX_RETRIES },
        `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed`
      );

      if (attempt === MAX_RETRIES) {
        logger.error("All MongoDB connection attempts exhausted. Server cannot start.");
        throw err;
      }

      // Disconnect any partial state before retrying
      await mongoose.disconnect().catch(() => {});
      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}

/** Returns true when connected to a persistent (non-ephemeral) MongoDB instance */
export function isPersistentDB(): boolean {
  return usingPersistentDB;
}
