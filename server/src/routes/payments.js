import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listPayments, createPayment, getPayment } from "../controllers/paymentsController.js";

const router = Router();

router.get("/payments", requireAuth, listPayments);
router.post("/payments", requireAuth, createPayment);
router.get("/payments/:id", requireAuth, getPayment);

export default router;
