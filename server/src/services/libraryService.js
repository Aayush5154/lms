import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { logger } from "../utils/logger.js";

export async function processLibraryImages(lib, data) {
  if (data.logoUrl !== undefined) {
    if (data.logoUrl === null || data.logoUrl === "") {
      if (lib.logo?.public_id) {
        await deleteFromCloudinary(lib.logo.public_id);
      }
      lib.logo = undefined;
    } else if (data.logoUrl && data.logoUrl.startsWith("http")) {
      // keep existing or new URL
    }
  }

  if (data.coverImageUrl !== undefined) {
    if (data.coverImageUrl === null || data.coverImageUrl === "") {
      if (lib.coverImage?.public_id) {
        await deleteFromCloudinary(lib.coverImage.public_id);
      }
      lib.coverImage = undefined;
    } else if (data.coverImageUrl && data.coverImageUrl.startsWith("http")) {
      // keep existing or new URL
    }
  }

  if (data.galleryImages !== undefined) {
    const newGallery = Array.isArray(data.galleryImages) ? data.galleryImages : [];
    const keptGallery = [];
    const newGalleryItems = [];

    for (const item of newGallery) {
      if (item && item.startsWith("http")) {
        const existing = lib.gallery?.find((g) => g.secure_url === item);
        if (existing) {
          keptGallery.push(existing);
        } else {
          keptGallery.push({ secure_url: item, public_id: "" });
        }
      }
    }

    const deletedItems = lib.gallery?.filter(
      (oldItem) => !keptGallery.some((kept) => kept.public_id === oldItem.public_id)
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

export function formatLibrary(lib) {
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
    coverImageUrl: lib.coverImage?.secure_url || null,
    galleryImages: lib.gallery?.length ? lib.gallery.map((g) => g.secure_url) : [],
    websiteEnabled: lib.websiteEnabled,
    websiteSlug: lib.websiteSlug ?? null,
    websiteTheme: lib.websiteTheme ?? "black-gold",
    membershipPlans: lib.membershipPlans ?? [],
  };
}
