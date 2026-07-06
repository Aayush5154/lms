import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listPayments, createPayment, getPayment } from "../controllers/paymentsController";

const router = Router();

router.get("/payments", requireAuth, listPayments);
router.post("/payments", requireAuth, createPayment);
router.get("/payments/:id", requireAuth, getPayment);

export default router;
