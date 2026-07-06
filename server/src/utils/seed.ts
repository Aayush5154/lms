import { Admin } from "../models/Admin";
import { logger } from "./logger";
import { getEnv, isProduction } from "../config/env";

export async function seedDatabase(): Promise<void> {
  const superEmail = getEnv("SUPER_ADMIN_EMAIL");
  const superPassword = getEnv("SUPER_ADMIN_PASSWORD");
  if (!superEmail || !superPassword) {
    const message = "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required to seed the initial super admin";
    if (isProduction()) throw new Error(message);
    logger.warn(message);
    return;
  }

  try {
    // Check by email first to prevent E11000 duplicate key errors.
    // This handles the case where an admin (any role) already has the
    // email specified in the env vars.
    const existingByEmail = await Admin.findOne({ email: superEmail });

    if (existingByEmail) {
      if (existingByEmail.role === "super_admin") {
        // Only sync credentials if the email actually changed
        if (existingByEmail.email !== superEmail) {
          existingByEmail.email = superEmail;
          existingByEmail.password = superPassword;
          await existingByEmail.save();
          logger.info({ email: superEmail }, "Super admin credentials synced from env");
        } else {
          logger.info({ email: superEmail }, "Admin already exists");
        }
      } else {
        logger.info({ email: superEmail }, "Admin already exists");
      }
      return;
    }

    // No admin with the target email — check if there's a super admin
    // with a different email that needs credential sync (email change)
    const existingSuperAdmin = await Admin.findOne({ role: "super_admin" });
    if (existingSuperAdmin) {
      existingSuperAdmin.email = superEmail;
      existingSuperAdmin.password = superPassword;
      await existingSuperAdmin.save();
      logger.info({ email: superEmail }, "Super admin credentials synced from env");
      return;
    }

    // No admin with this email and no super admin at all — create one
    await Admin.create({
      email: superEmail,
      password: superPassword,
      name: "Super Admin",
      libraryName: "LMS Platform",
      role: "super_admin",
    });
    logger.info({ email: superEmail }, "Super admin seeded");
  } catch (err: any) {
    // Safety net: handle E11000 gracefully in case of race conditions
    if (err?.code === 11000) {
      logger.warn({ email: superEmail }, "Duplicate key error during seed — admin already exists");
      return;
    }
    // Re-throw unexpected errors (e.g. connection failures)
    throw err;
  }
}
