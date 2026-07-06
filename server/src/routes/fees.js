import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { markPaid, markUnpaid } from "../controllers/feesController.js";

const router = Router();

router.post("/fees/mark-paid", requireAuth, markPaid);
router.post("/fees/mark-unpaid", requireAuth, markUnpaid);

export default router;
