import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { getEnv, isProduction } from "./env.js";

let isConnected = false;
let usingPersistentDB = false;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectDB() {
  if (isConnected) return;

  const uri = getEnv("MONGODB_URI");

  if (!uri) {
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
      logger.error({ err, attempt, maxRetries: MAX_RETRIES }, `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed`);
      if (attempt === MAX_RETRIES) {
        logger.error("All MongoDB connection attempts exhausted. Server cannot start.");
        throw err;
      }
      await mongoose.disconnect().catch(() => {});
      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}

export function isPersistentDB() {
  return usingPersistentDB;
}
