import cron from "node-cron";
import { Student } from "../models/Student.js";
import { logger } from "../utils/logger.js";

export function startScheduler() {
  cron.schedule("0 9 * * *", async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const overdue = await Student.find({
        isActive: true,
        feeStatus: { $ne: "paid" },
        nextDueDate: { $lt: today },
      }).lean();

      if (overdue.length === 0) {
        logger.info("Reminder scheduler: no overdue students today");
        return;
      }

      logger.info(
        { count: overdue.length, date: today },
        "Reminder scheduler: overdue students found — WhatsApp reminders pending"
      );

      for (const student of overdue) {
        logger.info(
          { studentId: student._id, name: student.name, phone: student.phone, daysOverdue: student.nextDueDate },
          "Reminder pending"
        );
      }
    } catch (err) {
      logger.error({ err }, "Reminder scheduler error");
    }
  }, {
    timezone: "Asia/Kolkata",
  });

  logger.info("Reminder scheduler started (daily 9:00 AM IST)");
}
