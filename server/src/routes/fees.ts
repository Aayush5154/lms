import { Router } from "express";
import { Student } from "../models/Student";
import { Payment } from "../models/Payment";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { computeNextDueDate, generateReceiptNumber, formatPayment } from "../utils/helpers";

const router = Router();

router.post("/fees/mark-paid", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const body = req.body as { studentId: string; amount: number; month: number; year: number; notes?: string };
    const student = await Student.findOne({ _id: body.studentId, adminId: req.adminId });
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }

    const payment = await Payment.create({
      adminId: req.adminId,
      studentId: student._id,
      studentName: student.name,
      seatNumber: student.seatNumber,
      amount: Number(body.amount),
      paymentDate: new Date().toISOString().split("T")[0]!,
      receiptNumber: generateReceiptNumber(),
      month: Number(body.month),
      year: Number(body.year),
      notes: body.notes,
    });

    student.feeStatus = "paid";
    student.nextDueDate = computeNextDueDate(student.feeDueDate);
    await student.save();

    res.json(formatPayment(payment.toObject() as any));
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to mark paid" });
  }
});

router.post("/fees/mark-unpaid", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { studentId } = req.body as { studentId: string };
    const student = await Student.findOneAndUpdate(
      { _id: studentId, adminId: req.adminId },
      { feeStatus: "unpaid" },
      { new: true }
    );
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    res.json({ message: "Fee marked as unpaid" });
  } catch { res.status(500).json({ error: "Failed to mark unpaid" }); }
});

export default router;
