import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { logger } from "./logger.js";
import { requireEnv } from "../config/env.js";

function assertCloudinaryConfigured() {
  requireEnv("CLOUDINARY_CLOUD_NAME");
  requireEnv("CLOUDINARY_API_KEY");
  requireEnv("CLOUDINARY_API_SECRET");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileStr, folder) {
  try {
    assertCloudinaryConfigured();
    const response = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
      transformation: [
        { quality: "auto:good", fetch_format: "auto" }
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

export async function deleteFromCloudinary(public_id) {
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

const createMulterStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
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
