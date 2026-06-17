import { format } from "date-fns";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface ReceiptData {
  receiptNumber: string | undefined | null;
  studentName: string | undefined | null;
  seatNumber: number | undefined | null;
  paymentDate: string | undefined | null;
  month: number | undefined | null;
  year: number | undefined | null;
  amount: number | undefined | null;
  notes?: string | null | undefined;
}

export function getReceiptHtml(data: ReceiptData): string {
  const monthName = MONTHS[(data.month ?? 1) - 1];
  return `
    <html><head><title>Receipt - ${data.receiptNumber}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 24px; color: #111; }
      .receipt { max-width: 520px; margin: auto; border: 2px solid #222; border-radius: 8px; padding: 28px; }
      .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 16px; margin-bottom: 16px; }
      .header h1 { margin: 0; font-size: 22px; } .header p { color: #555; font-size: 13px; margin: 4px 0; }
      .badge { background: #16a34a; color: white; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: bold; }
      .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
      .amount-row { display: flex; justify-content: space-between; margin-top: 8px; background: #f0fdf4; border-radius: 6px; padding: 10px 12px; }
      .footer { text-align: center; margin-top: 20px; color: #888; font-size: 11px; border-top: 1px dashed #ccc; padding-top: 12px; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <div class="receipt">
      <div class="header">
        <h1>📚 PAYMENT RECEIPT</h1>
        <p>Library Management System</p>
        <span class="badge">✓ PAID</span>
      </div>
      <div class="row"><span style="color:#666">Receipt No.</span><span style="font-weight:600;font-family:monospace">${data.receiptNumber}</span></div>
      <div class="row"><span style="color:#666">Student Name</span><span style="font-weight:600">${data.studentName}</span></div>
      <div class="row"><span style="color:#666">Seat Number</span><span style="font-weight:600">#${data.seatNumber}</span></div>
      <div class="row"><span style="color:#666">Payment Date</span><span style="font-weight:600">${data.paymentDate ? format(new Date(data.paymentDate), "dd MMM, yyyy") : "—"}</span></div>
      <div class="row"><span style="color:#666">For Month</span><span style="font-weight:600">${monthName} ${data.year}</span></div>
      ${data.notes ? `<div class="row"><span style="color:#666">Notes</span><span style="font-weight:600">${data.notes}</span></div>` : ""}
      <div class="amount-row">
        <span style="color:#166534;font-weight:700;font-size:15px">Amount Paid</span>
        <span style="color:#16a34a;font-weight:800;font-size:18px">₹${Number(data.amount).toLocaleString()}</span>
      </div>
      <div class="footer">Thank you! This is a computer-generated receipt.</div>
    </div>
    </body></html>
  `;
}

export function openReceiptPrint(data: ReceiptData): void {
  const html = getReceiptHtml(data);
  const win = window.open("", "_blank", "width=600,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}
