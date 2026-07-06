import { useState, useRef } from "react";
import { useRecordPayment } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, Printer, CheckCircle2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { openReceiptPrint } from "@/utils/receiptTemplate";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const now = /* @__PURE__ */ new Date();
function RecordPaymentDialog({ student, open, onClose }) {
  const queryClient = useQueryClient();
  const recordMutation = useRecordPayment();
  const receiptRef = useRef(null);
  const [amount, setAmount] = useState(String(student.monthlyFee));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [paymentDate, setPaymentDate] = useState(now.toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [receipt, setReceipt] = useState(null);
  const reset = () => {
    setAmount(String(student.monthlyFee));
    setMonth(String(now.getMonth() + 1));
    setYear(String(now.getFullYear()));
    setPaymentDate(now.toISOString().split("T")[0]);
    setNotes("");
    setReceipt(null);
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    recordMutation.mutate({
      data: {
        studentId: student.id,
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
        paymentDate,
        notes: notes || void 0
      }
    }, {
      onSuccess: (payment) => {
        setReceipt(payment);
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["/api/seats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
        toast.success("Payment recorded!");
      },
      onError: (err) => {
        const msg = err?.data?.error ?? err?.message ?? "Failed to record payment";
        toast.error(msg);
      }
    });
  };
  const handlePrint = () => {
    if (!receipt) return;
    openReceiptPrint({
      receiptNumber: receipt.receiptNumber,
      studentName: receipt.studentName,
      seatNumber: receipt.seatNumber,
      paymentDate: receipt.paymentDate,
      month: receipt.month ?? 1,
      year: receipt.year,
      amount: receipt.amount,
      notes: receipt.notes
    });
  };
  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  if (receipt) {
    return <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" /> Payment Recorded
            </DialogTitle>
          </DialogHeader>

          <div ref={receiptRef}>
            <div className="receipt" style={{ fontFamily: "'Segoe UI', sans-serif", border: "2px solid #222", borderRadius: "8px", padding: "28px" }}>
              <div className="header" style={{ textAlign: "center", borderBottom: "2px dashed #ccc", paddingBottom: "16px", marginBottom: "16px" }}>
                <h1 style={{ margin: 0, fontSize: "22px", letterSpacing: "1px" }}>📚 PAYMENT RECEIPT</h1>
                <p style={{ margin: "4px 0", color: "#555", fontSize: "13px" }}>Library Management System</p>
                <span className="badge" style={{ display: "inline-block", background: "#16a34a", color: "white", padding: "4px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "bold", marginTop: "8px" }}>
                  ✓ PAID
                </span>
              </div>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                <span className="label" style={{ color: "#666" }}>Receipt No.</span>
                <span className="value" style={{ fontWeight: 600, fontFamily: "monospace" }}>{receipt.receiptNumber}</span>
              </div>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                <span className="label" style={{ color: "#666" }}>Student Name</span>
                <span className="value" style={{ fontWeight: 600 }}>{receipt.studentName}</span>
              </div>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                <span className="label" style={{ color: "#666" }}>Seat Number</span>
                <span className="value" style={{ fontWeight: 600 }}>#{receipt.seatNumber}</span>
              </div>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                <span className="label" style={{ color: "#666" }}>Payment Date</span>
                <span className="value" style={{ fontWeight: 600 }}>{format(new Date(receipt.paymentDate), "dd MMM, yyyy")}</span>
              </div>
              <div className="row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                <span className="label" style={{ color: "#666" }}>For Month</span>
                <span className="value" style={{ fontWeight: 600 }}>{MONTHS[(receipt.month ?? 1) - 1]} {receipt.year}</span>
              </div>
              {receipt.notes && <div className="row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                  <span className="label" style={{ color: "#666" }}>Notes</span>
                  <span className="value" style={{ fontWeight: 600 }}>{receipt.notes}</span>
                </div>}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", background: "#f0fdf4", borderRadius: "6px", padding: "10px 12px" }}>
                <span style={{ color: "#166534", fontWeight: 700, fontSize: "15px" }}>Amount Paid</span>
                <span style={{ color: "#16a34a", fontWeight: 800, fontSize: "18px" }}>₹{Number(receipt.amount).toLocaleString()}</span>
              </div>
              <div style={{ textAlign: "center", marginTop: "20px", color: "#888", fontSize: "11px", borderTop: "1px dashed #ccc", paddingTop: "12px" }}>
                Thank you! This is a computer-generated receipt.
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" /> Close
            </Button>
            <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
              <Printer className="w-4 h-4 mr-2" /> Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>;
  }
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Record Payment
          </DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">
            {student.name} · Seat #{student.seatNumber}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Amount (₹) *</Label>
            <Input
    type="number"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    placeholder="e.g. 800"
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Month *</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Year *</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Payment Date *</Label>
            <Input
    type="date"
    value={paymentDate}
    onChange={(e) => setPaymentDate(e.target.value)}
  />
          </div>

          <div className="space-y-1">
            <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
    placeholder="e.g. Cash payment"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={recordMutation.isPending} className="bg-green-600 hover:bg-green-700">
            {recordMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Recording...</> : <><CreditCard className="w-4 h-4 mr-2" /> Record Payment</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}
export {
  RecordPaymentDialog
};
