import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listSeats, updateSeatsConfig } from "../controllers/seatsController";

const router = Router();

router.get("/seats", requireAuth, listSeats);
router.put("/seats/config", requireAuth, updateSeatsConfig);

export default router;
