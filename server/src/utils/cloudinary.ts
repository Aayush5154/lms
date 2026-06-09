import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { logger } from "./logger";
import { requireEnv } from "../config/env";

function assertCloudinaryConfigured(): void {
  requireEnv("CLOUDINARY_CLOUD_NAME");
  requireEnv("CLOUDINARY_API_KEY");
  requireEnv("CLOUDINARY_API_SECRET");
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Reusable service to upload a Base64 image or file path to Cloudinary
 */
export async function uploadToCloudinary(
  fileStr: string,
  folder: string
): Promise<{ secure_url: string; public_id: string }> {
  try {
    assertCloudinaryConfigured();
    const response = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
      transformation: [
        { quality: "auto:good", fetch_format: "auto" } // Image compression & optimization
      ],
    });
    return {
      secure_url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    logger.error({ error, folder }, "Failed to upload image to Cloudinary");
    throw error;
  }
}

/**
 * Reusable service to delete an image from Cloudinary
 */
export async function deleteFromCloudinary(public_id: string): Promise<void> {
  if (!public_id) return;
  try {
    assertCloudinaryConfigured();
    const result = await cloudinary.uploader.destroy(public_id);
    if (result.result !== "ok") {
      logger.warn({ public_id, result }, "Cloudinary destroy did not return ok");
    }
  } catch (error) {
    logger.error({ error, public_id }, "Failed to delete image from Cloudinary");
    throw error;
  }
}

/**
 * Reusable Multer storage configurations for different upload directories
 */
const createMulterStorage = (folder: string) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => {
      assertCloudinaryConfigured();
      return {
        folder: folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
          { quality: "auto:good", fetch_format: "auto" }
        ],
      };
    },
  });
};

export const uploadLogo = multer({ storage: createMulterStorage("library-management/logos") });
export const uploadCover = multer({ storage: createMulterStorage("library-management/covers") });
export const uploadGallery = multer({ storage: createMulterStorage("library-management/galleries") });
export const uploadStudent = multer({ storage: createMulterStorage("library-management/students") });

export { cloudinary };
