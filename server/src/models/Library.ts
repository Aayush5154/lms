import mongoose, { Schema, Document } from "mongoose";

export interface ICloudinaryImage {
  secure_url: string;
  public_id: string;
}

export interface ILibrary extends Document {
  adminId: mongoose.Types.ObjectId;
  libraryName: string;
  totalSeats: number;
  upiId?: string;
  upiQrUrl?: string;
  whatsappNumber?: string;
  address?: string;
  phone?: string;
  isApproved: boolean;
  isSuspended: boolean;
  setupCompleted: boolean;
  language: string;
  theme: string;
  ownerName?: string;
  city?: string;
  state?: string;
  openingTime?: string;
  closingTime?: string;
  monthlyFeeDefault?: number;
  libraryType?: string;
  description?: string;
  facilities: string[];
  googleMapsLink?: string;
  websiteEnabled: boolean;
  websiteSlug?: string;
  websiteTheme?: string;
  // Cloudinary image fields
  logo?: ICloudinaryImage;
  coverImage?: ICloudinaryImage;
  gallery: ICloudinaryImage[];
}

const LibrarySchema = new Schema<ILibrary>(
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
    // Cloudinary schemas
    logo: {
      secure_url: { type: String },
      public_id: { type: String }
    },
    coverImage: {
      secure_url: { type: String },
      public_id: { type: String }
    },
    gallery: {
      type: [{
        secure_url: { type: String },
        public_id: { type: String }
      }],
      default: []
    }
  },
  { timestamps: true }
);

export const Library = mongoose.models["Library"] || mongoose.model<ILibrary>("Library", LibrarySchema);
