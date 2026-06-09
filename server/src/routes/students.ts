import { Router } from "express";
import { logger } from "../utils/logger";
import { Student } from "../models/Student";
import { Payment } from "../models/Payment";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { computeNextDueDate, formatStudent, formatPayment } from "../utils/helpers";
import { uploadStudent, uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import { escapeRegex, parsePagination, toPositiveInteger, toPositiveNumber, trimString } from "../utils/request";

const router = Router();

router.get("/students", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { search, feeStatus, page = "1", limit = "50" } = req.query as Record<string, string>;
    const { page: pageNum, limit: limitNum, skip } = parsePagination({ page, limit });

    const query: Record<string, unknown> = { adminId: req.adminId, isActive: true };
    if (feeStatus && feeStatus !== "all") query["feeStatus"] = feeStatus;
    if (search) {
      const safeSearch = escapeRegex(search.trim());
      query["$or"] = [
        { name: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } },
        { fatherName: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const [total, students] = await Promise.all([
      Student.countDocuments(query),
      Student.find(query)
        .sort({ seatNumber: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({ students: students.map(s => formatStudent(s as any)), total, page: pageNum, limit: limitNum });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to list students" });
  }
});

router.post("/students", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const body = req.body as {
      name: string; phone: string; fatherName: string; seatNumber: number;
      joiningDate: string; monthlyFee: number; feeDueDate: number;
      feeStatus?: string; shifts?: string[]; notes?: string; whatsappNumber?: string;
    };

    const name = trimString(body.name);
    const phone = trimString(body.phone);
    const fatherName = trimString(body.fatherName);
    const seatNumber = toPositiveInteger(body.seatNumber);
    const monthlyFee = toPositiveNumber(body.monthlyFee);
    const feeDueDate = toPositiveInteger(body.feeDueDate) ?? 1;
    if (!name || !phone || !fatherName || !seatNumber || !body.joiningDate || !monthlyFee) {
      res.status(400).json({ error: "Missing required fields: name, phone, fatherName, seatNumber, joiningDate, monthlyFee" });
      return;
    }

    const existing = await Student.findOne({ adminId: req.adminId, seatNumber, isActive: true }).select("_id").lean();
    if (existing) { res.status(400).json({ error: `Seat ${seatNumber} is already occupied` }); return; }

    const shifts = Array.isArray(body.shifts) ? body.shifts.filter(s => ["morning", "day", "full", "night"].includes(s)) : [];

    const student = await Student.create({
      adminId: req.adminId,
      name,
      phone,
      fatherName,
      seatNumber,
      joiningDate: body.joiningDate,
      monthlyFee,
      feeDueDate,
      feeStatus: body.feeStatus ?? "unpaid",
      shifts: shifts.length > 0 ? shifts : [],
      nextDueDate: computeNextDueDate(feeDueDate),
      notes: trimString(body.notes),
      whatsappNumber: trimString(body.whatsappNumber),
      isActive: true,
    });

    res.status(201).json(formatStudent(student.toObject() as any));
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Seat number already occupied" });
    } else {
      res.status(500).json({ error: err.message ?? "Failed to create student" });
    }
  }
});

router.get("/students/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const student = await Student.findOne({ _id: req.params["id"], adminId: req.adminId }).lean();
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    res.json(formatStudent(student as any));
  } catch { res.status(500).json({ error: "Failed to get student" }); }
});

router.put("/students/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const student = await Student.findOne({ _id: req.params["id"], adminId: req.adminId });
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }

    if (body["seatNumber"] && Number(body["seatNumber"]) !== student.seatNumber) {
      const conflict = await Student.findOne({ adminId: req.adminId, seatNumber: Number(body["seatNumber"]), isActive: true, _id: { $ne: student._id } });
      if (conflict) { res.status(400).json({ error: `Seat ${body["seatNumber"]} is already occupied` }); return; }
    }

    const allowed = ["name", "phone", "fatherName", "seatNumber", "joiningDate", "monthlyFee", "feeDueDate", "feeStatus", "shifts", "notes", "whatsappNumber", "isActive"];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "shifts" && Array.isArray(body[key])) {
          (student as any)[key] = (body[key] as string[]).filter(s => ["morning", "day", "full", "night"].includes(s));
        } else {
          (student as any)[key] = body[key];
        }
      }
    }
    if (body["feeDueDate"]) student.nextDueDate = computeNextDueDate(Number(body["feeDueDate"]));

    await student.save();
    res.json(formatStudent(student.toObject() as any));
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to update student" });
  }
});

router.delete("/students/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params["id"], adminId: req.adminId },
      { isActive: false },
      { new: true }
    );
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    res.json({ message: "Student deleted successfully" });
  } catch { res.status(500).json({ error: "Failed to delete student" }); }
});

router.post("/students/:id/photo", requireAuth, uploadStudent.single("file"), async (req: AuthRequest, res): Promise<void> => {
  try {
    const student = await Student.findOne({ _id: req.params["id"], adminId: req.adminId });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    let uploaded: { secure_url: string; public_id: string } | null = null;

    if (req.file) {
      uploaded = {
        secure_url: req.file.path,
        public_id: req.file.filename
      };
    } else {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    if (!uploaded) {
      res.status(400).json({ error: "No image file or Base64 data provided" });
      return;
    }

    if (student.photo?.public_id) {
      await deleteFromCloudinary(student.photo.public_id);
    }

    student.photo = uploaded;
    student.photoUrl = undefined;
    await student.save();

    res.json(formatStudent(student.toObject()));
  } catch (err: any) {
    logger.error({ err, studentId: req.params["id"] }, "Failed to upload student photo");
    res.status(500).json({ error: "Failed to upload student photo" });
  }
});

router.get("/students/:id/payments", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string | undefined>, { page: 1, limit: 50, maxLimit: 100 });
    const payments = await Payment.find({ studentId: req.params["id"], adminId: req.adminId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    res.setHeader("X-Page", String(page));
    res.setHeader("X-Limit", String(limit));
    res.json(payments.map(p => formatPayment(p as any)));
  } catch { res.status(500).json({ error: "Failed to get payments" }); }
});

export default router;
