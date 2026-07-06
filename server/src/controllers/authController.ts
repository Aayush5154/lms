import type { Request, Response } from "express";
import { Admin } from "../models/Admin";
import { Library } from "../models/Library";
import { signToken, type AuthRequest } from "../middleware/auth";
import { processLibraryImages } from "../services/libraryService";

// POST /auth/login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }

    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
    if (!admin) { res.status(401).json({ error: "Invalid credentials" }); return; }

    const valid = await (admin as any).comparePassword(password);
    if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }

    const token = signToken(String(admin._id), admin.role);
    res.json({
      token,
      admin: {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        libraryName: admin.libraryName,
        role: admin.role,
        whatsappNumber: admin.whatsappNumber ?? null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
}

// GET /auth/me
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: String(admin._id), email: admin.email, name: admin.name, libraryName: admin.libraryName, role: admin.role, whatsappNumber: admin.whatsappNumber ?? null });
  } catch {
    res.status(500).json({ error: "Failed to get profile" });
  }
}

// POST /auth/change-password
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    const admin = await Admin.findById(req.adminId);
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }
    const valid = await (admin as any).comparePassword(currentPassword);
    if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ error: "Failed to change password" });
  }
}

// POST /auth/forgot-password
export async function forgotPassword(_req: Request, res: Response): Promise<void> {
  res.json({ message: "If the email exists, a reset link has been sent" });
}

// GET /super/admins
export async function listAdmins(_req: Request, res: Response): Promise<void> {
  try {
    const admins = await Admin.find({ role: "library_admin" }).select("-password").lean();
    const libraries = await Library.find().lean();
    const libMap = new Map(libraries.map(l => [String(l.adminId), l]));
    const result = admins.map(a => ({ ...a, id: String(a._id), library: libMap.get(String(a._id)) ?? null }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
}

// POST /super/libraries
export async function createLibrary(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, libraryName, totalSeats } = req.body as { email: string; password: string; name: string; libraryName: string; totalSeats?: number };
    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) { res.status(400).json({ error: "Email already registered" }); return; }

    const admin = await Admin.create({ email, password, name, libraryName, role: "library_admin" });
    const library = await Library.create({ adminId: admin._id, libraryName, totalSeats: totalSeats ?? 50 });
    res.status(201).json({ admin: { id: String(admin._id), email: admin.email, name: admin.name }, library });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to create library" });
  }
}

// PATCH /super/libraries/:adminId/approve
export async function approveLibrary(req: Request, res: Response): Promise<void> {
  try {
    await Library.findOneAndUpdate({ adminId: req.params["adminId"] }, { isApproved: true });
    await Admin.findByIdAndUpdate(req.params["adminId"], { isActive: true });
    res.json({ message: "Library approved" });
  } catch { res.status(500).json({ error: "Failed" }); }
}

// PATCH /super/libraries/:adminId/suspend
export async function suspendLibrary(req: Request, res: Response): Promise<void> {
  try {
    await Library.findOneAndUpdate({ adminId: req.params["adminId"] }, { isSuspended: true });
    await Admin.findByIdAndUpdate(req.params["adminId"], { isActive: false });
    res.json({ message: "Library suspended" });
  } catch { res.status(500).json({ error: "Failed" }); }
}

// DELETE /super/libraries/:adminId
export async function deleteLibrary(req: Request, res: Response): Promise<void> {
  try {
    await Library.findOneAndDelete({ adminId: req.params["adminId"] });
    await Admin.findByIdAndDelete(req.params["adminId"]);
    res.json({ message: "Library deleted" });
  } catch { res.status(500).json({ error: "Failed" }); }
}

// PATCH /super/libraries/:adminId/reset-password
export async function resetAdminPassword(req: Request, res: Response): Promise<void> {
  try {
    const { newPassword } = req.body as { newPassword: string };
    const admin = await Admin.findById(req.params["adminId"]);
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }
    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password reset successfully" });
  } catch { res.status(500).json({ error: "Failed" }); }
}

// PUT /super/libraries/:adminId/config
export async function updateLibraryConfig(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    let lib = await Library.findOne({ adminId: req.params["adminId"] });
    if (!lib) { res.status(404).json({ error: "Library not found" }); return; }

    if (data.websiteSlug && data.websiteSlug !== lib.websiteSlug) {
      const exists = await Library.findOne({ websiteSlug: data.websiteSlug, _id: { $ne: lib._id } });
      if (exists) { res.status(400).json({ error: "Website slug is already taken" }); return; }
    }

    await processLibraryImages(lib, data);

    const fields = ['libraryName', 'totalSeats', 'upiId', 'upiQrUrl', 'whatsappNumber', 'address', 'phone',
      'setupCompleted', 'language', 'theme', 'ownerName', 'city', 'state', 'openingTime', 'closingTime',
      'monthlyFeeDefault', 'libraryType', 'description', 'facilities', 'googleMapsLink', 'websiteEnabled', 'websiteSlug'];

    for (const field of fields) {
      if (data[field] !== undefined) (lib as any)[field] = data[field];
    }
    await lib.save();
    res.json({ message: "Configuration updated successfully" });
  } catch (err: any) { res.status(500).json({ error: err.message ?? "Failed to update configuration" }); }
}
