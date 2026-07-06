import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadLogo as uploadLogoMiddleware, uploadCover as uploadCoverMiddleware, uploadGallery as uploadGalleryMiddleware } from "../utils/cloudinary.js";
import {
  getLibrary, updateLibrary, getPublicLibrary, uploadLogo, uploadCover, uploadGallery,
} from "../controllers/libraryController.js";

const router = Router();

router.get("/library", requireAuth, getLibrary);
router.put("/library", requireAuth, updateLibrary);
router.get("/public/libraries/:id", getPublicLibrary);
router.post("/library/logo", requireAuth, uploadLogoMiddleware.single("file"), uploadLogo);
router.post("/library/cover", requireAuth, uploadCoverMiddleware.single("file"), uploadCover);
router.post("/library/gallery", requireAuth, uploadGalleryMiddleware.array("files", 6), uploadGallery);

export default router;
