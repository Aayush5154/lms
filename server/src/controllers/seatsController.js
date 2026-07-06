import { Student } from "../models/Student.js";
import { Library } from "../models/Library.js";
import { formatStudent } from "../utils/helpers.js";

export async function listSeats(req, res) {
  try {
    const { status, search } = req.query;
    const lib = await Library.findOne({ adminId: req.adminId });
    const totalSeats = lib?.totalSeats ?? 50;
    const activeStudents = await Student.find({ adminId: req.adminId, isActive: true }).lean();
    const occupiedMap = new Map();
    for (const s of activeStudents) occupiedMap.set(s.seatNumber, s);
    const today = new Date().toISOString().split("T")[0];
    let seats = Array.from({ length: totalSeats }, (_, i) => {
      const seatNumber = i + 1;
      const student = occupiedMap.get(seatNumber);
      let seatStatus = "vacant";
      if (student) {
        if (student.feeStatus === "paid") seatStatus = "paid";
        else if (student.feeStatus === "overdue" || (student.nextDueDate && student.nextDueDate < today)) seatStatus = "overdue";
        else seatStatus = "due-soon";
      }
      return { seatNumber, isOccupied: !!student, status: seatStatus, student: student ? formatStudent(student) : undefined };
    });
    if (status === "occupied") seats = seats.filter(s => s.isOccupied);
    else if (status === "vacant") seats = seats.filter(s => !s.isOccupied);
    if (search) {
      const n = parseInt(search, 10);
      if (!isNaN(n)) seats = seats.filter(s => s.seatNumber === n);
    }
    res.json(seats);
  } catch { res.status(500).json({ error: "Failed to get seats" }); }
}

export async function updateSeatsConfig(req, res) {
  try {
    const { totalSeats } = req.body;
    if (!totalSeats || totalSeats < 1) { res.status(400).json({ error: "totalSeats must be at least 1" }); return; }
    await Library.findOneAndUpdate({ adminId: req.adminId }, { totalSeats }, { upsert: true });
    res.json({ message: `Total seats updated to ${totalSeats}` });
  } catch { res.status(500).json({ error: "Failed to update seat config" }); }
}
