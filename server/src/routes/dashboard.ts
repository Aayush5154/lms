import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getStats,
  getRevenue,
  getOccupancy,
  getRecentPayments,
  getDuesToday,
  getOverdue,
  getMonthlyRevenue,
  getPendingFees,
} from "../controllers/dashboardController";

const router = Router();

router.get("/dashboard/stats", requireAuth, getStats);
router.get("/dashboard/revenue", requireAuth, getRevenue);
router.get("/dashboard/occupancy", requireAuth, getOccupancy);
router.get("/dashboard/recent-payments", requireAuth, getRecentPayments);
router.get("/dashboard/dues-today", requireAuth, getDuesToday);
router.get("/dashboard/overdue", requireAuth, getOverdue);

router.get("/reports/monthly-revenue", requireAuth, getMonthlyRevenue);
router.get("/reports/pending-fees", requireAuth, getPendingFees);

export default router;
