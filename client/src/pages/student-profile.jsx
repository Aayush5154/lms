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
import { openReceiptPrint } from "@/utils/receiptTemplate";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function StudentProfile() {
  const [, params] = useRoute("/students/:id");
  const id = params?.id || "";
  const [showPayment, setShowPayment] = useState(false);
  const { data: student, isLoading } = useGetStudent(id, { query: { queryKey: getGetStudentQueryKey(id), enabled: !!id } });
  const { data: payments, isLoading: paymentsLoading } = useGetStudentPayments(id, { query: { queryKey: getGetStudentPaymentsQueryKey(id), enabled: !!id } });
  if (isLoading) return <div className="p-6"><Skeleton className="h-[400px] w-full" /></div>;
  if (!student) return <div className="p-6">Student not found</div>;
  const handlePrintReceipt = (payment) => {
    if (!payment) return;
    openReceiptPrint({
      receiptNumber: payment.receiptNumber,
      studentName: payment.studentName,
      seatNumber: payment.seatNumber,
      paymentDate: payment.paymentDate,
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      notes: payment.notes
    });
  };
  return <div className="space-y-6 max-w-4xl mx-auto page-enter">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/students"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
        <div className="flex-1" />
        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm btn-press" onClick={() => setShowPayment(true)}>
          <CreditCard className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 card-shadow card-enter card-enter-delay-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-indigo-50 mb-4 overflow-hidden border-4 border-background shadow-md">
               {student.photoUrl ? <img src={student.photoUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                   {student.name.substring(0, 2).toUpperCase()}
                 </div>}
            </div>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-sm text-muted-foreground">{student.phone}</p>
            <div className="mt-4 flex gap-2 flex-wrap justify-center">
              <Badge variant="secondary">Seat #{student.seatNumber}</Badge>
              {student.feeStatus === "paid" ? <Badge className="bg-emerald-500 hover:bg-emerald-600">Paid</Badge> : student.feeStatus === "overdue" ? <Badge variant="destructive">Overdue</Badge> : <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Unpaid</Badge>}
              {student.shifts && student.shifts.map((shift) => <Badge key={shift} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 capitalize">{shift}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 card-shadow card-enter card-enter-delay-2">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">Father's Name</p><p className="font-medium">{student.fatherName}</p></div>
            <div><p className="text-muted-foreground">WhatsApp</p><p className="font-medium">{student.whatsappNumber || "N/A"}</p></div>
            <div><p className="text-muted-foreground">Joining Date</p><p className="font-medium">{format(new Date(student.joiningDate), "dd MMM, yyyy")}</p></div>
            <div><p className="text-muted-foreground">Monthly Fee</p><p className="font-medium">₹{student.monthlyFee}</p></div>
            <div><p className="text-muted-foreground">Fee Due Day</p><p className="font-medium">Day {student.feeDueDate} of every month</p></div>
            <div><p className="text-muted-foreground">Next Due Date</p><p className="font-medium">{student.nextDueDate ? format(new Date(student.nextDueDate), "dd MMM, yyyy") : "N/A"}</p></div>
            <div><p className="text-muted-foreground">Status</p><p className="font-medium">{student.isActive ? "Active" : "Inactive"}</p></div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Shifts</p>
              {student.shifts && student.shifts.length > 0 ? <div className="flex gap-1 flex-wrap mt-1">
                  {student.shifts.map((shift) => <Badge key={shift} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 capitalize text-xs">{shift}</Badge>)}
                </div> : <p className="font-medium text-muted-foreground">None assigned</p>}
            </div>
            {student.notes && <div className="col-span-2"><p className="text-muted-foreground">Notes</p><p className="font-medium">{student.notes}</p></div>}
          </CardContent>
        </Card>
      </div>

      <Card className="card-shadow card-enter card-enter-delay-3">
        <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent>
          {paymentsLoading ? <Skeleton className="h-40 w-full" /> : <div className="space-y-2.5">
              {!payments || payments.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No payments recorded yet</p>
                  <Button variant="outline" className="mt-3" onClick={() => setShowPayment(true)}>Record First Payment</Button>
                </div> : payments.map((payment) => <div key={payment.id} className="flex justify-between items-center p-3 border border-border/60 rounded-xl table-row-hover">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-600">₹{Number(payment.amount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground font-mono">{payment.receiptNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{MONTHS[(payment.month ?? 1) - 1]} {payment.year}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(payment.paymentDate), "dd MMM, yyyy")}</p>
                      </div>                          <Button
    variant="ghost"
    size="icon"
    className="h-7 w-7 text-muted-foreground hover:text-foreground transition-all duration-150 hover:scale-110"
    title="Print receipt"
    onClick={() => handlePrintReceipt(payment)}
  >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>)}
            </div>}
        </CardContent>
      </Card>

      {showPayment && <RecordPaymentDialog student={student} open={showPayment} onClose={() => setShowPayment(false)} />}
    </div>;
}
export {
  StudentProfile as default
};
