import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getEnv, isProduction } from "./env";

let isConnected = false;
let mongoServer: MongoMemoryServer | null = null;

async function startInMemory(): Promise<string> {
  logger.warn("⚠️  Falling back to in-memory MongoDB. Data will NOT persist across restarts.");
  mongoServer = await MongoMemoryServer.create();
  return mongoServer.getUri();
}

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  let uri = getEnv("MONGODB_URI");
  let usingCloud = !!uri;

  if (!uri) {
    if (isProduction()) {
      throw new Error("MONGODB_URI must be configured in production");
    }
    logger.info("MONGODB_URI not provided. Starting in-memory MongoDB server...");
    uri = await startInMemory();
    usingCloud = false;
  }

  // Try connecting to the configured URI (Atlas or local)
  try {
    await mongoose.connect(uri, {
      dbName: "library_lms",
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    isConnected = true;
    logger.info(`MongoDB connected: ${usingCloud ? "Cloud (Atlas)" : "In-Memory"}`);
  } catch (cloudErr) {
    if (usingCloud) {
      logger.error({ err: cloudErr }, "MongoDB Atlas connection failed");
      if (isProduction()) throw cloudErr;
      logger.warn("Retrying with in-memory MongoDB so the dev server can still run...");
      try {
        // Disconnect any partial connection attempt
        await mongoose.disconnect().catch(() => {});
        const memUri = await startInMemory();
        await mongoose.connect(memUri, { dbName: "library_lms" });
        isConnected = true;
        logger.info("MongoDB connected: In-Memory (Atlas was unreachable)");
      } catch (memErr) {
        logger.error({ err: memErr }, "DB init error");
        throw memErr;
      }
    } else {
      logger.error({ err: cloudErr }, "DB init error");
      throw cloudErr;
    }
  }

  // Note: Cloudinary migration script has been removed.
}
