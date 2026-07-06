import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadStudent } from "../utils/cloudinary.js";
import {
  listStudents, createStudent, getStudent, updateStudent,
  deleteStudent, uploadStudentPhoto, getStudentPayments,
} from "../controllers/studentsController.js";

const router = Router();

router.get("/students", requireAuth, listStudents);
router.post("/students", requireAuth, createStudent);
router.get("/students/:id", requireAuth, getStudent);
router.put("/students/:id", requireAuth, updateStudent);
router.delete("/students/:id", requireAuth, deleteStudent);
router.post("/students/:id/photo", requireAuth, uploadStudent.single("file"), uploadStudentPhoto);
router.get("/students/:id/payments", requireAuth, getStudentPayments);

export default router;
