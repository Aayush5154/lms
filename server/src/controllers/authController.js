import { Admin } from "../models/Admin.js";
import { Library } from "../models/Library.js";
import { signToken } from "../middleware/auth.js";
import { processLibraryImages } from "../services/libraryService.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }
    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
    if (!admin) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const valid = await admin.comparePassword(password);
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

export async function getMe(req, res) {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: String(admin._id), email: admin.email, name: admin.name, libraryName: admin.libraryName, role: admin.role, whatsappNumber: admin.whatsappNumber ?? null });
  } catch {
    res.status(500).json({ error: "Failed to get profile" });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.adminId);
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }
    const valid = await admin.comparePassword(currentPassword);
    if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ error: "Failed to change password" });
  }
}

export async function forgotPassword(_req, res) {
  res.json({ message: "If the email exists, a reset link has been sent" });
}

export async function listAdmins(_req, res) {
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

export async function createLibrary(req, res) {
  try {
    const { email, password, name, libraryName, totalSeats } = req.body;
    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) { res.status(400).json({ error: "Email already registered" }); return; }
    const admin = await Admin.create({ email, password, name, libraryName, role: "library_admin" });
    const library = await Library.create({ adminId: admin._id, libraryName, totalSeats: totalSeats ?? 50 });
    res.status(201).json({ admin: { id: String(admin._id), email: admin.email, name: admin.name }, library });
  } catch (err) {
    res.status(500).json({ error: err.message ?? "Failed to create library" });
  }
}

export async function approveLibrary(req, res) {
  try {
    await Library.findOneAndUpdate({ adminId: req.params["adminId"] }, { isApproved: true });
    await Admin.findByIdAndUpdate(req.params["adminId"], { isActive: true });
    res.json({ message: "Library approved" });
  } catch { res.status(500).json({ error: "Failed" }); }
}

export async function suspendLibrary(req, res) {
  try {
    await Library.findOneAndUpdate({ adminId: req.params["adminId"] }, { isSuspended: true });
    await Admin.findByIdAndUpdate(req.params["adminId"], { isActive: false });
    res.json({ message: "Library suspended" });
  } catch { res.status(500).json({ error: "Failed" }); }
}

export async function deleteLibrary(req, res) {
  try {
    await Library.findOneAndDelete({ adminId: req.params["adminId"] });
    await Admin.findByIdAndDelete(req.params["adminId"]);
    res.json({ message: "Library deleted" });
  } catch { res.status(500).json({ error: "Failed" }); }
}

export async function resetAdminPassword(req, res) {
  try {
    const { newPassword } = req.body;
    const admin = await Admin.findById(req.params["adminId"]);
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }
    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password reset successfully" });
  } catch { res.status(500).json({ error: "Failed" }); }
}

export async function updateLibraryConfig(req, res) {
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
      if (data[field] !== undefined) lib[field] = data[field];
    }
    await lib.save();
    res.json({ message: "Configuration updated successfully" });
  } catch (err) { res.status(500).json({ error: err.message ?? "Failed to update configuration" }); }
}
