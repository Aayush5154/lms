import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getPendingReminders } from "../controllers/remindersController";

const router = Router();

router.get("/reminders/pending", requireAuth, getPendingReminders);

export default router;
