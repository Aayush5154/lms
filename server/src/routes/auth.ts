import { Router } from "express";
import { authRateLimiter } from "../middleware/security";
import { requireAuth, requireSuperAdmin } from "../middleware/auth";
import {
  login,
  getMe,
  changePassword,
  forgotPassword,
  listAdmins,
  createLibrary,
  approveLibrary,
  suspendLibrary,
  deleteLibrary,
  resetAdminPassword,
  updateLibraryConfig,
} from "../controllers/authController";

const router = Router();

router.post("/auth/login", authRateLimiter, login);
router.get("/auth/me", requireAuth, getMe);
router.post("/auth/change-password", requireAuth, changePassword);
router.post("/auth/forgot-password", forgotPassword);

router.get("/super/admins", requireSuperAdmin, listAdmins);
router.post("/super/libraries", requireSuperAdmin, createLibrary);
router.patch("/super/libraries/:adminId/approve", requireSuperAdmin, approveLibrary);
router.patch("/super/libraries/:adminId/suspend", requireSuperAdmin, suspendLibrary);
router.delete("/super/libraries/:adminId", requireSuperAdmin, deleteLibrary);
router.patch("/super/libraries/:adminId/reset-password", requireSuperAdmin, resetAdminPassword);
router.put("/super/libraries/:adminId/config", requireSuperAdmin, updateLibraryConfig);

export default router;
