import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: String, required: true },
    receiptNumber: { type: String, required: true, unique: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ adminId: 1, createdAt: -1 });
PaymentSchema.index({ adminId: 1, month: 1, year: 1, createdAt: -1 });
PaymentSchema.index({ adminId: 1, paymentDate: -1 });
PaymentSchema.index({ adminId: 1, studentId: 1, createdAt: -1 });

export const Payment = mongoose.models["Payment"] || mongoose.model("Payment", PaymentSchema);
