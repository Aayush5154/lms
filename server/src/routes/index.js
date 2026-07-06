import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import libraryRouter from "./library.js";
import studentsRouter from "./students.js";
import seatsRouter from "./seats.js";
import paymentsRouter from "./payments.js";
import feesRouter from "./fees.js";
import dashboardRouter from "./dashboard.js";
import remindersRouter from "./reminders.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(libraryRouter);
router.use(studentsRouter);
router.use(seatsRouter);
router.use(paymentsRouter);
router.use(feesRouter);
router.use(dashboardRouter);
router.use(remindersRouter);

export default router;
