import { Admin } from "../models/Admin";
import { logger } from "./logger";
import { getEnv, isProduction } from "../config/env";

export async function seedDatabase(): Promise<void> {
  const existingSuperAdmin = await Admin.findOne({ role: "super_admin" });
  if (!existingSuperAdmin) {
    const superEmail = getEnv("SUPER_ADMIN_EMAIL");
    const superPassword = getEnv("SUPER_ADMIN_PASSWORD");
    if (!superEmail || !superPassword) {
      const message = "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required to seed the initial super admin";
      if (isProduction()) throw new Error(message);
      logger.warn(message);
      return;
    }
    await Admin.create({
      email: superEmail,
      password: superPassword,
      name: "Super Admin",
      libraryName: "LMS Platform",
      role: "super_admin",
    });
    logger.info({ email: superEmail }, "Super admin seeded");
  }
}
