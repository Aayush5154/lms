import { Admin } from "../models/Admin.js";
import { logger } from "./logger.js";
import { getEnv, isProduction } from "../config/env.js";

export async function seedDatabase() {
  const superEmail = getEnv("SUPER_ADMIN_EMAIL");
  const superPassword = getEnv("SUPER_ADMIN_PASSWORD");
  if (!superEmail || !superPassword) {
    const message = "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required to seed the initial super admin";
    if (isProduction()) throw new Error(message);
    logger.warn(message);
    return;
  }

  const existingSuperAdmin = await Admin.findOne({ role: "super_admin" });
  if (!existingSuperAdmin) {
    await Admin.create({
      email: superEmail,
      password: superPassword,
      name: "Super Admin",
      libraryName: "LMS Platform",
      role: "super_admin",
    });
    logger.info({ email: superEmail }, "Super admin seeded");
  } else if (existingSuperAdmin.email !== superEmail) {
    existingSuperAdmin.email = superEmail;
    existingSuperAdmin.password = superPassword;
    await existingSuperAdmin.save();
    logger.info({ email: superEmail }, "Super admin credentials synced from env");
  }
}
