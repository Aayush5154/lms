const productionRequired = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SUPER_ADMIN_EMAIL",
  "SUPER_ADMIN_PASSWORD",
  "CLIENT_URL",
];

export function isProduction() {
  return process.env["NODE_ENV"] === "production";
}

export function getEnv(name) {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export function requireEnv(name) {
  const value = getEnv(name);
  if (!value) throw new Error(`${name} must be configured`);
  return value;
}

export function validateProductionEnv() {
  if (!isProduction()) return;
  const missing = productionRequired.filter(name => !getEnv(name));
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }
}
