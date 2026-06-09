import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import libraryRouter from "./library";
import studentsRouter from "./students";
import seatsRouter from "./seats";
import paymentsRouter from "./payments";
import feesRouter from "./fees";
import dashboardRouter from "./dashboard";
import remindersRouter from "./reminders";

const router: IRouter = Router();

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
