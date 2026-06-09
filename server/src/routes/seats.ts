import { Router } from "express";
import { Student } from "../models/Student";
import { Library } from "../models/Library";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { formatStudent } from "../utils/helpers";

const router = Router();

router.get("/seats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };
    const lib = await Library.findOne({ adminId: req.adminId });
    const totalSeats = lib?.totalSeats ?? 50;

    const activeStudents = await Student.find({ adminId: req.adminId, isActive: true }).lean();
    const occupiedMap = new Map<number, typeof activeStudents[0]>();
    for (const s of activeStudents) occupiedMap.set(s.seatNumber, s);

    const today = new Date().toISOString().split("T")[0]!;

    let seats = Array.from({ length: totalSeats }, (_, i) => {
      const seatNumber = i + 1;
      const student = occupiedMap.get(seatNumber);
      let seatStatus: "vacant" | "paid" | "due-soon" | "overdue" = "vacant";
      if (student) {
        if (student.feeStatus === "paid") seatStatus = "paid";
        else if (student.feeStatus === "overdue" || (student.nextDueDate && student.nextDueDate < today)) seatStatus = "overdue";
        else seatStatus = "due-soon";
      }
      return {
        seatNumber,
        isOccupied: !!student,
        status: seatStatus,
        student: student ? formatStudent(student as any) : undefined,
      };
    });

    if (status === "occupied") seats = seats.filter(s => s.isOccupied);
    else if (status === "vacant") seats = seats.filter(s => !s.isOccupied);
    if (search) {
      const n = parseInt(search, 10);
      if (!isNaN(n)) seats = seats.filter(s => s.seatNumber === n);
    }

    res.json(seats);
  } catch { res.status(500).json({ error: "Failed to get seats" }); }
});

router.put("/seats/config", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { totalSeats } = req.body as { totalSeats: number };
    if (!totalSeats || totalSeats < 1) { res.status(400).json({ error: "totalSeats must be at least 1" }); return; }
    await Library.findOneAndUpdate({ adminId: req.adminId }, { totalSeats }, { upsert: true });
    res.json({ message: `Total seats updated to ${totalSeats}` });
  } catch { res.status(500).json({ error: "Failed to update seat config" }); }
});

export default router;
