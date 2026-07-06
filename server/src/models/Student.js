import mongoose, { Schema } from "mongoose";

const StudentSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    fatherName: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    joiningDate: { type: String, required: true },
    monthlyFee: { type: Number, required: true },
    feeDueDate: { type: Number, required: true, default: 1 },
    feeStatus: { type: String, enum: ["paid", "unpaid", "overdue"], default: "unpaid" },
    shifts: { type: [String], enum: ["morning", "day", "full", "night"], default: [] },
    nextDueDate: { type: String },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    whatsappNumber: { type: String },
    photo: {
      secure_url: { type: String },
      public_id: { type: String }
    }
  },
  { timestamps: true }
);

StudentSchema.index({ adminId: 1, seatNumber: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
StudentSchema.index({ adminId: 1, isActive: 1, feeStatus: 1 });
StudentSchema.index({ adminId: 1, isActive: 1, nextDueDate: 1 });

export const Student = mongoose.models["Student"] || mongoose.model("Student", StudentSchema);
