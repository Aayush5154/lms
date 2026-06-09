import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import { logger } from "../utils/logger";

export async function processLibraryImages(lib: any, data: any) {
  // Handle Logo
  if (data.logoUrl !== undefined) {
    if (data.logoUrl === null || data.logoUrl === "") {
      if (lib.logo?.public_id) {
        await deleteFromCloudinary(lib.logo.public_id);
      }
      lib.logo = undefined;
    } else if (data.logoUrl && data.logoUrl.startsWith("http")) {
      // The frontend should now directly use the multer upload endpoints.
      // If logoUrl is passed as an http string, it means we're keeping it or updating to a new URL.
      if (lib.logo?.public_id && lib.logo.secure_url !== data.logoUrl) {
         // Optionally delete old image if it's a different URL
         // await deleteFromCloudinary(lib.logo.public_id);
      }
      // If using Cloudinary upload endpoints, this might just be a reference update
    }
  }

  // Handle Cover Image
  if (data.coverImageUrl !== undefined) {
    if (data.coverImageUrl === null || data.coverImageUrl === "") {
      if (lib.coverImage?.public_id) {
        await deleteFromCloudinary(lib.coverImage.public_id);
      }
      lib.coverImage = undefined;
    } else if (data.coverImageUrl && data.coverImageUrl.startsWith("http")) {
      if (lib.coverImage?.public_id && lib.coverImage.secure_url !== data.coverImageUrl) {
        // await deleteFromCloudinary(lib.coverImage.public_id);
      }
    }
  }

  // Handle Gallery Images
  if (data.galleryImages !== undefined) {
    const newGallery = Array.isArray(data.galleryImages) ? data.galleryImages : [];
    const keptGallery: any[] = [];
    const newGalleryItems: any[] = [];

    for (const item of newGallery) {
      if (item && item.startsWith("http")) {
        const existing = lib.gallery?.find((g: any) => g.secure_url === item);
        if (existing) {
          keptGallery.push(existing);
        } else {
          // If it's a URL but not in lib.gallery, maybe it was migrated or uploaded directly, keep it
          keptGallery.push({ secure_url: item, public_id: "" });
        }
      }
    }

    const deletedItems = lib.gallery?.filter(
      (oldItem: any) => !keptGallery.some((kept: any) => kept.public_id === oldItem.public_id)
    ) || [];

    for (const item of deletedItems) {
      if (item.public_id) {
        try {
          await deleteFromCloudinary(item.public_id);
        } catch (err) {
          logger.error({ err, public_id: item.public_id }, "Failed to delete old gallery image from Cloudinary");
        }
      }
    }

    lib.gallery = [...keptGallery, ...newGalleryItems];
  }
}

export function formatLibrary(lib: any) {
  return {
    libraryName: lib.libraryName,
    totalSeats: lib.totalSeats,
    upiId: lib.upiId ?? null,
    upiQrUrl: lib.upiQrUrl ?? null,
    whatsappNumber: lib.whatsappNumber ?? null,
    address: lib.address ?? null,
    phone: lib.phone ?? null,
    setupCompleted: lib.setupCompleted,
    language: lib.language,
    theme: lib.theme,
    ownerName: lib.ownerName ?? null,
    city: lib.city ?? null,
    state: lib.state ?? null,
    openingTime: lib.openingTime ?? null,
    closingTime: lib.closingTime ?? null,
    monthlyFeeDefault: lib.monthlyFeeDefault ?? null,
    libraryType: lib.libraryType ?? null,
    description: lib.description ?? null,
    facilities: lib.facilities ?? [],
    googleMapsLink: lib.googleMapsLink ?? null,
    logo: lib.logo ?? null,
    coverImage: lib.coverImage ?? null,
    gallery: lib.gallery ?? [],
    logoUrl: lib.logo?.secure_url || null,
    logoPublicId: lib.logo?.public_id || null,
    coverImageUrl: lib.coverImage?.secure_url || null,
    coverPublicId: lib.coverImage?.public_id || null,
    galleryImages: lib.gallery && lib.gallery.length > 0 ? lib.gallery.map((g: any) => g.secure_url) : [],
    websiteEnabled: lib.websiteEnabled,
    websiteSlug: lib.websiteSlug ?? null,
    websiteTheme: lib.websiteTheme ?? "black-gold",
  };
}
