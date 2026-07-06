import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, default: "Admin" },
    libraryName: { type: String, required: true, default: "My Study Library" },
    whatsappNumber: { type: String },
    role: { type: String, enum: ["super_admin", "library_admin"], default: "library_admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

AdminSchema.methods["comparePassword"] = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

AdminSchema.index({ email: 1, isActive: 1 });
AdminSchema.index({ role: 1 });

export const Admin = mongoose.models["Admin"] || mongoose.model("Admin", AdminSchema);
