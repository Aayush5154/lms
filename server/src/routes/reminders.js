import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getPendingReminders } from "../controllers/remindersController.js";

const router = Router();

router.get("/reminders/pending", requireAuth, getPendingReminders);

export default router;
