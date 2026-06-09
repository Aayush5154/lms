export function computeNextDueDate(feeDueDate: number): string {
  const now = new Date();
  let dueDate = new Date(now.getFullYear(), now.getMonth(), feeDueDate);
  if (dueDate <= now) {
    dueDate = new Date(now.getFullYear(), now.getMonth() + 1, feeDueDate);
  }
  return dueDate.toISOString().split("T")[0] as string;
}

export function generateReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `RCP${year}${month}${day}${rand}`;
}

export function formatStudent(s: Record<string, any>) {
  return {
    id: String(s["_id"] ?? s["id"]),
    name: s["name"],
    phone: s["phone"],
    fatherName: s["fatherName"],
    photoUrl: s["photo"]?.secure_url || s["photoUrl"] || null,
    photo: s["photo"] || null,
    seatNumber: s["seatNumber"],
    joiningDate: s["joiningDate"],
    monthlyFee: Number(s["monthlyFee"]),
    feeDueDate: s["feeDueDate"],
    feeStatus: s["feeStatus"],
    nextDueDate: s["nextDueDate"] ?? null,
    notes: s["notes"] ?? null,
    isActive: s["isActive"],
    whatsappNumber: s["whatsappNumber"] ?? null,
    shifts: s["shifts"] ?? [],
    createdAt: s["createdAt"],
  };
}

export function formatPayment(p: Record<string, unknown>) {
  return {
    id: String(p["_id"] ?? p["id"]),
    studentId: String(p["studentId"]),
    studentName: p["studentName"],
    seatNumber: p["seatNumber"],
    amount: Number(p["amount"]),
    paymentDate: p["paymentDate"],
    receiptNumber: p["receiptNumber"],
    month: p["month"],
    year: p["year"],
    notes: p["notes"] ?? null,
    createdAt: p["createdAt"],
  };
}
