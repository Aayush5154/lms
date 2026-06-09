import { Router } from "express";
import mongoose from "mongoose";
import { Student } from "../models/Student";
import { Payment } from "../models/Payment";
import { Library } from "../models/Library";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { formatStudent, formatPayment } from "../utils/helpers";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const today = new Date().toISOString().split("T")[0]!;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]!;
    const adminObjectId = new mongoose.Types.ObjectId(req.adminId);

    const [lib, [studentStats], [paymentStats]] = await Promise.all([
      Library.findOne({ adminId: req.adminId }).select("totalSeats").lean(),
      Student.aggregate([
        { $match: { adminId: adminObjectId, isActive: true } },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            pendingFees: {
              $sum: { $cond: [{ $ne: ["$feeStatus", "paid"] }, "$monthlyFee", 0] }
            },
            overdueCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$feeStatus", "overdue"] },
                      { $and: [{ $ne: ["$feeStatus", "paid"] }, { $lt: ["$nextDueDate", today] }, { $ne: ["$nextDueDate", null] }] }
                    ]
                  },
                  1, 0
                ]
              }
            }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { adminId: adminObjectId, paymentDate: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            todayCollection: {
              $sum: { $cond: [{ $eq: ["$paymentDate", today] }, "$amount", 0] }
            },
            monthlyCollection: { $sum: "$amount" }
          }
        }
      ]),
    ]);

    const totalSeats = lib?.totalSeats ?? 50;
    const totalStudents = studentStats?.totalStudents ?? 0;
    const pendingFees = studentStats?.pendingFees ?? 0;
    const overdueCount = studentStats?.overdueCount ?? 0;
    const todayCollection = paymentStats?.todayCollection ?? 0;
    const monthlyCollection = paymentStats?.monthlyCollection ?? 0;

    res.json({
      totalSeats,
      occupiedSeats: totalStudents,
      vacantSeats: Math.max(0, totalSeats - totalStudents),
      totalStudents,
      pendingFees,
      todayCollection,
      monthlyCollection,
      overdueCount
    });
  } catch {
    res.status(500).json({ error: "Failed to get stats" }); 
  }
});

router.get("/dashboard/revenue", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    const adminObjectId = new mongoose.Types.ObjectId(req.adminId);
    const first = months[0]!;
    const last = months[months.length - 1]!;
    const totals = await Payment.aggregate([
      {
        $match: {
          adminId: adminObjectId,
          $or: [
            { year: { $gt: first.year, $lt: last.year } },
            { year: first.year, month: { $gte: first.month } },
            { year: last.year, month: { $lte: last.month } },
          ],
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const totalMap = new Map(totals.map(t => [`${t._id.year}-${t._id.month}`, t]));
    const results = months.map(({ month, year }) => {
      const total = totalMap.get(`${year}-${month}`);
      return { month, year, monthLabel: `${monthLabels[month - 1]} ${year}`, revenue: total?.revenue ?? 0, count: total?.count ?? 0 };
    });
    res.json(results);
  } catch { res.status(500).json({ error: "Failed to get revenue" }); }
});

router.get("/dashboard/occupancy", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const [lib, occupied] = await Promise.all([
      Library.findOne({ adminId: req.adminId }).select("totalSeats").lean(),
      Student.countDocuments({ adminId: req.adminId, isActive: true }),
    ]);
    const totalSeats = lib?.totalSeats ?? 50;
    res.json({ occupied, vacant: Math.max(0, totalSeats - occupied), total: totalSeats, occupancyRate: totalSeats > 0 ? Math.round((occupied / totalSeats) * 100) : 0 });
  } catch { res.status(500).json({ error: "Failed to get occupancy" }); }
});

router.get("/dashboard/recent-payments", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const payments = await Payment.find({ adminId: req.adminId }).sort({ createdAt: -1 }).limit(10).lean();
    res.json(payments.map(p => formatPayment(p as any)));
  } catch { res.status(500).json({ error: "Failed to get recent payments" }); }
});

router.get("/dashboard/dues-today", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const today = new Date().toISOString().split("T")[0]!;
    const students = await Student.find({ adminId: req.adminId, isActive: true, feeStatus: { $ne: "paid" }, nextDueDate: today }).lean();
    res.json(students.map(s => formatStudent(s as any)));
  } catch { res.status(500).json({ error: "Failed to get dues today" }); }
});

router.get("/dashboard/overdue", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const today = new Date().toISOString().split("T")[0]!;
    const students = await Student.find({ adminId: req.adminId, isActive: true, feeStatus: { $ne: "paid" }, nextDueDate: { $lt: today } }).lean();
    res.json(students.map(s => formatStudent(s as any)));
  } catch { res.status(500).json({ error: "Failed to get overdue" }); }
});

router.get("/reports/monthly-revenue", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const now = new Date();
    const month = parseInt(String(req.query["month"] ?? now.getMonth() + 1), 10);
    const year = parseInt(String(req.query["year"] ?? now.getFullYear()), 10);
    const payments = await Payment.find({ adminId: req.adminId, month, year }).sort({ paymentDate: -1 }).lean();
    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    res.json({ month, year, totalRevenue, totalStudents: payments.length, payments: payments.map(p => formatPayment(p as any)) });
  } catch { res.status(500).json({ error: "Failed to get monthly report" }); }
});

router.get("/reports/pending-fees", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const students = await Student.find({ adminId: req.adminId, isActive: true, feeStatus: { $ne: "paid" } }).sort({ nextDueDate: 1 }).lean();
    res.json(students.map(s => formatStudent(s as any)));
  } catch { res.status(500).json({ error: "Failed to get pending fees" }); }
});

export default router;
