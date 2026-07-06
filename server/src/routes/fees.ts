import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { markPaid, markUnpaid } from "../controllers/feesController";

const router = Router();

router.post("/fees/mark-paid", requireAuth, markPaid);
router.post("/fees/mark-unpaid", requireAuth, markUnpaid);

export default router;
