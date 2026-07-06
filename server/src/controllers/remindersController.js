import { Student } from "../models/Student.js";
import { formatStudent } from "../utils/helpers.js";

export async function getPendingReminders(req, res) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const overdue = await Student.find({
      adminId: req.adminId,
      isActive: true,
      $or: [
        { feeStatus: "overdue" },
        { feeStatus: { $ne: "paid" }, nextDueDate: { $lt: today } },
      ],
    }).sort({ nextDueDate: 1 }).lean();
    res.json({ students: overdue.map(s => formatStudent(s)), count: overdue.length });
  } catch {
    res.status(500).json({ error: "Failed to get pending reminders" });
  }
}
