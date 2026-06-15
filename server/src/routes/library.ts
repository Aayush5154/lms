import { Router } from "express";
import { Library } from "../models/Library";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { processLibraryImages, formatLibrary } from "../services/libraryService";
import { uploadLogo, uploadCover, uploadGallery } from "../utils/cloudinary";
import { logger } from "../utils/logger";

const router = Router();

async function getOrCreate(adminId: string) {
  let lib = await Library.findOne({ adminId });
  if (!lib) lib = await Library.create({ adminId, libraryName: "My Study Library", totalSeats: 50 });
  return lib;
}

router.get("/library", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const lib = await getOrCreate(req.adminId!);
    res.json(formatLibrary(lib));
  } catch { res.status(500).json({ error: "Failed to get library config" }); }
});

router.put("/library", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const lib = await getOrCreate(req.adminId!);
    const data = req.body;
    
    // Check if websiteSlug is being updated and if it's unique
    if (data.websiteSlug && data.websiteSlug !== lib.websiteSlug) {
      const exists = await Library.findOne({ websiteSlug: data.websiteSlug, _id: { $ne: lib._id } });
      if (exists) {
        res.status(400).json({ error: "Website slug is already taken" });
        return;
      }
    }

    // Process image updates if any
    await processLibraryImages(lib, data);

    // Update all allowed fields
    const fields = ['libraryName', 'totalSeats', 'upiId', 'upiQrUrl', 'whatsappNumber', 'address', 'phone', 
      'setupCompleted', 'language', 'theme', 'ownerName', 'city', 'state', 'openingTime', 'closingTime', 
      'monthlyFeeDefault', 'libraryType', 'description', 'facilities', 'googleMapsLink', 'websiteEnabled', 'websiteSlug', 'websiteTheme', 'membershipPlans'];
    
    for (const field of fields) {
      if (data[field] !== undefined) {
        (lib as any)[field] = data[field];
      }
    }
    
    await lib.save();
    res.json(formatLibrary(lib));
  } catch (err) {
    logger.error({ err, adminId: req.adminId }, "Failed to update library config");
    res.status(500).json({ error: "Failed to update library config" }); 
  }
});

router.get("/public/libraries/:id", async (req, res): Promise<void> => {
  try {
    const id = req.params.id;
    let lib;
    
    // Check if valid ObjectId, else query by slug
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      lib = await Library.findById(id);
    } else {
      lib = await Library.findOne({ websiteSlug: id });
    }

    if (!lib) {
      res.status(404).json({ error: "Library not found" });
      return;
    }
    
    if (!lib.websiteEnabled) {
      res.status(403).json({ error: "Public website is disabled for this library" });
      return;
    }
    
    res.json(formatLibrary(lib));
  } catch { res.status(500).json({ error: "Failed to fetch public library config" }); }
});

// Multer Direct upload endpoints
router.post("/library/logo", requireAuth, uploadLogo.single("file"), async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const lib = await getOrCreate(req.adminId!);
    // Delete old logo
    const { deleteFromCloudinary } = await import("../utils/cloudinary");
    if (lib.logo?.public_id) {
      await deleteFromCloudinary(lib.logo.public_id);
    }
    lib.logo = {
      secure_url: req.file.path,
      public_id: req.file.filename,
    };
    await lib.save();
    res.json(formatLibrary(lib));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload logo" });
  }
});

router.post("/library/cover", requireAuth, uploadCover.single("file"), async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const lib = await getOrCreate(req.adminId!);
    const { deleteFromCloudinary } = await import("../utils/cloudinary");
    if (lib.coverImage?.public_id) {
      await deleteFromCloudinary(lib.coverImage.public_id);
    }
    lib.coverImage = {
      secure_url: req.file.path,
      public_id: req.file.filename,
    };
    await lib.save();
    res.json(formatLibrary(lib));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload cover" });
  }
});

router.post("/library/gallery", requireAuth, uploadGallery.array("files", 6), async (req: AuthRequest, res): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }
    const lib = await getOrCreate(req.adminId!);
    const uploadedImages = files.map(f => ({
      secure_url: f.path,
      public_id: f.filename
    }));
    
    // Check if replacing
    const replaceIndexStr = req.query.replaceIndex as string;
    if (replaceIndexStr) {
      const replaceIndex = parseInt(replaceIndexStr, 10);
      if (replaceIndex >= 0 && replaceIndex < (lib.gallery?.length || 0)) {
        const oldImage = lib.gallery[replaceIndex];
        const { deleteFromCloudinary } = await import("../utils/cloudinary");
        if (oldImage && oldImage.public_id) {
           try { await deleteFromCloudinary(oldImage.public_id); } catch(e) {}
        }
        lib.gallery[replaceIndex] = uploadedImages[0];
      }
    } else {
      // Append to existing gallery
      lib.gallery = [...(lib.gallery || []), ...uploadedImages].slice(0, 6);
    }
    
    await lib.save();
    res.json(formatLibrary(lib));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload gallery images" });
  }
});

export default router;
