import { useState } from "react";
import { useRoute } from "wouter";
import { useGetStudent, useGetStudentPayments, getGetStudentQueryKey, getGetStudentPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, Printer } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function StudentProfile() {
  const [, params] = useRoute("/students/:id");
  const id = params?.id || "";
  const [showPayment, setShowPayment] = useState(false);

  const { data: student, isLoading } = useGetStudent(id, {
    query: { queryKey: getGetStudentQueryKey(id), enabled: !!id }
  });

  const { data: payments, isLoading: paymentsLoading } = useGetStudentPayments(id, {
    query: { queryKey: getGetStudentPaymentsQueryKey(id), enabled: !!id }
  });

  if (isLoading) {
    return <div className="p-6"><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!student) {
    return <div className="p-6">Student not found</div>;
  }

  const handlePrintReceipt = (payment: typeof payments extends Array<infer T> | undefined ? T : never) => {
    if (!payment) return;
    const win = window.open("", "_blank", "width=600,height=700");
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt - ${payment.receiptNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 24px; color: #111; }
        .receipt { max-width: 520px; margin: auto; border: 2px solid #222; border-radius: 8px; padding: 28px; }
        .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 16px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 22px; } .header p { color: #555; font-size: 13px; }
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
        <div class="row"><span style="color:#666">Receipt No.</span><span style="font-weight:600;font-family:monospace">${payment.receiptNumber}</span></div>
        <div class="row"><span style="color:#666">Student Name</span><span style="font-weight:600">${payment.studentName}</span></div>
        <div class="row"><span style="color:#666">Seat Number</span><span style="font-weight:600">#${payment.seatNumber}</span></div>
        <div class="row"><span style="color:#666">Payment Date</span><span style="font-weight:600">${format(new Date(payment.paymentDate), "dd MMM, yyyy")}</span></div>
        <div class="row"><span style="color:#666">For Month</span><span style="font-weight:600">${MONTHS[(payment.month ?? 1) - 1]} ${payment.year}</span></div>
        ${payment.notes ? `<div class="row"><span style="color:#666">Notes</span><span style="font-weight:600">${payment.notes}</span></div>` : ""}
        <div class="amount-row">
          <span style="color:#166534;font-weight:700;font-size:15px">Amount Paid</span>
          <span style="color:#16a34a;font-weight:800;font-size:18px">₹${Number(payment.amount).toLocaleString()}</span>
        </div>
        <div class="footer">Thank you! This is a computer-generated receipt.</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/students"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
        <div className="flex-1" />
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowPayment(true)}
        >
          <CreditCard className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-muted mb-4 overflow-hidden border-4 border-background shadow-md">
               {student.photoUrl ? (
                 <img src={student.photoUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                   {student.name.substring(0,2).toUpperCase()}
                 </div>
               )}
            </div>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-sm text-muted-foreground">{student.phone}</p>
            <div className="mt-4 flex gap-2 flex-wrap justify-center">
              <Badge variant="secondary">Seat #{student.seatNumber}</Badge>
              {student.feeStatus === "paid"
                ? <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                : student.feeStatus === "overdue"
                ? <Badge variant="destructive">Overdue</Badge>
                : <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Unpaid</Badge>}
              {(student as any).shifts && (student as any).shifts.map((shift: string) => (
                <Badge key={shift} className="bg-blue-100 text-blue-700 hover:bg-blue-100 capitalize">
                  {shift}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Father's Name</p>
              <p className="font-medium">{student.fatherName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">WhatsApp</p>
              <p className="font-medium">{student.whatsappNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Joining Date</p>
              <p className="font-medium">{format(new Date(student.joiningDate), "dd MMM, yyyy")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Fee</p>
              <p className="font-medium">₹{student.monthlyFee}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fee Due Day</p>
              <p className="font-medium">Day {student.feeDueDate} of every month</p>
            </div>
            <div>
              <p className="text-muted-foreground">Next Due Date</p>
              <p className="font-medium">{student.nextDueDate ? format(new Date(student.nextDueDate), "dd MMM, yyyy") : "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{student.isActive ? "Active" : "Inactive"}</p>
            </div>
            {(student as any).shifts && (student as any).shifts.length > 0 && (
              <div>
                <p className="text-muted-foreground">Shifts</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {(student as any).shifts.map((shift: string) => (
                    <Badge key={shift} className="bg-blue-100 text-blue-700 hover:bg-blue-100 capitalize text-xs">
                      {shift}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {student.notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Notes</p>
                <p className="font-medium">{student.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-3">
              {!payments || payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>No payments recorded yet</p>
                  <Button variant="outline" className="mt-3" onClick={() => setShowPayment(true)}>
                    Record First Payment
                  </Button>
                </div>
              ) : (
                payments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-700">₹{Number(payment.amount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground font-mono">{payment.receiptNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{MONTHS[(payment.month ?? 1) - 1]} {payment.year}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(payment.paymentDate), "dd MMM, yyyy")}</p>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Print receipt"
                        onClick={() => handlePrintReceipt(payment)}
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showPayment && (
        <RecordPaymentDialog
          student={student as any}
          open={showPayment}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
