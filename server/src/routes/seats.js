import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listSeats, updateSeatsConfig } from "../controllers/seatsController.js";

const router = Router();

router.get("/seats", requireAuth, listSeats);
router.put("/seats/config", requireAuth, updateSeatsConfig);

export default router;
