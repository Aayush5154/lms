import mongoose, { Schema } from "mongoose";

const LibrarySchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, unique: true },
    libraryName: { type: String, required: true, default: "My Study Library" },
    totalSeats: { type: Number, required: true, default: 50 },
    upiId: { type: String },
    upiQrUrl: { type: String },
    whatsappNumber: { type: String },
    address: { type: String },
    phone: { type: String },
    isApproved: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    setupCompleted: { type: Boolean, default: false },
    language: { type: String, default: "en" },
    theme: { type: String, default: "black-gold" },
    ownerName: { type: String },
    city: { type: String },
    state: { type: String },
    openingTime: { type: String },
    closingTime: { type: String },
    monthlyFeeDefault: { type: Number },
    libraryType: { type: String },
    description: { type: String },
    facilities: { type: [String], default: [] },
    googleMapsLink: { type: String },
    websiteEnabled: { type: Boolean, default: true },
    websiteSlug: { type: String, unique: true, sparse: true },
    websiteTheme: { type: String, default: "black-gold" },
    logo: {
      secure_url: { type: String },
      public_id: { type: String }
    },
    coverImage: {
      secure_url: { type: String },
      public_id: { type: String }
    },
    gallery: {
      type: [{ secure_url: { type: String }, public_id: { type: String } }],
      default: []
    },
    membershipPlans: {
      type: [{ name: { type: String }, price: { type: String }, description: { type: String }, features: { type: [String] }, recommended: { type: Boolean, default: false } }],
      default: []
    }
  },
  { timestamps: true }
);

export const Library = mongoose.models["Library"] || mongoose.model("Library", LibrarySchema);
