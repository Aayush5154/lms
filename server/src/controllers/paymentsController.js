import { Payment } from "../models/Payment.js";
import { Student } from "../models/Student.js";
import { computeNextDueDate, generateReceiptNumber, formatPayment } from "../utils/helpers.js";
import { parsePagination, toPositiveInteger, toPositiveNumber } from "../utils/request.js";

export async function listPayments(req, res) {
  try {
    const { month, year, page = "1", limit = "50" } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination({ page, limit });
    const query = { adminId: req.adminId };
    if (month) query.month = Number.parseInt(month, 10);
    if (year) query.year = Number.parseInt(year, 10);
    const [total, payments] = await Promise.all([
      Payment.countDocuments(query),
      Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    ]);
    res.json({ payments: payments.map(p => formatPayment(p)), total, page: pageNum, limit: limitNum });
  } catch { res.status(500).json({ error: "Failed to list payments" }); }
}

export async function createPayment(req, res) {
  try {
    const body = req.body;
    const amount = toPositiveNumber(body.amount);
    const month = toPositiveInteger(body.month);
    const year = toPositiveInteger(body.year);
    if (!body.studentId || !amount || !month || !year) {
      res.status(400).json({ error: "studentId, amount, month, and year are required" });
      return;
    }
    const student = await Student.findOne({ _id: body.studentId, adminId: req.adminId });
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const receiptNumber = generateReceiptNumber();
    const paymentDate = body.paymentDate ?? new Date().toISOString().split("T")[0];
    const payment = await Payment.create({
      adminId: req.adminId, studentId: student._id, studentName: student.name,
      seatNumber: student.seatNumber, amount, paymentDate, receiptNumber, month, year, notes: body.notes,
    });
    student.feeStatus = "paid";
    student.nextDueDate = computeNextDueDate(student.feeDueDate);
    await student.save();
    res.status(201).json(formatPayment(payment.toObject()));
  } catch (err) {
    res.status(500).json({ error: err.message ?? "Failed to create payment" });
  }
}

export async function getPayment(req, res) {
  try {
    const payment = await Payment.findOne({ _id: req.params["id"], adminId: req.adminId }).lean();
    if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
    res.json(formatPayment(payment));
  } catch { res.status(500).json({ error: "Failed to get payment" }); }
}
