import { useState } from "react";
import { useGetOverdueStudents, useGetDuesToday, useMarkFeePaid } from "@workspace/api-client-react";
import type { Student } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";

function buildWhatsAppMessage(student: Student): string {
  const phone = ((student as any).whatsappNumber || student.phone || "").replace(/\D/g, "");
  const daysOverdue = student.nextDueDate
    ? differenceInDays(new Date(), new Date(student.nextDueDate))
    : 0;
  const dueInfo = student.nextDueDate
    ? `due on ${format(new Date(student.nextDueDate), "d MMM yyyy")}`
    : "overdue";
  const text = encodeURIComponent(
    `Hello ${student.name},\n\nThis is a reminder from your study library.\n\nYour monthly fee of ₹${student.monthlyFee} was ${dueInfo}${daysOverdue > 0 ? ` (${daysOverdue} day${daysOverdue > 1 ? "s" : ""} overdue)` : ""}.\n\nPlease clear your dues at the earliest to avoid any inconvenience.\n\nThank you 🙏`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

function openWhatsApp(student: Student) {
  const phone = ((student as any).whatsappNumber || student.phone || "").replace(/\D/g, "");
  if (!phone) { toast.error(`No phone number for ${student.name}`); return false; }
  window.open(buildWhatsAppMessage(student), "_blank");
  return true;
}

export default function Fees() {
  const [tab, setTab] = useState("overdue");
  const { data: overdue, isLoading: overdueLoading } = useGetOverdueStudents();
  const { data: duesToday, isLoading: duesLoading } = useGetDuesToday();
  const overdueList = overdue || [];
  const dueList = duesToday || [];

  const handleSendAll = (students: Student[]) => {
    if (students.length === 0) { toast.info("No students to remind"); return; }
    let sent = 0;
    students.forEach((s, i) => {
      setTimeout(() => {
        if (openWhatsApp(s)) sent++;
        if (i === students.length - 1) {
          toast.success(`Opened WhatsApp for ${sent} student${sent !== 1 ? "s" : ""}`);
        }
      }, i * 600);
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
            Fee Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 ml-[52px]">Track dues, send WhatsApp reminders, and record payments</p>
        </div>
      </div>

      {/* Reminder banner */}
      {!overdueLoading && overdueList.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><MessageCircle className="w-4 h-4 text-red-600" /></div>
            <div>
              <p className="font-semibold text-red-700 text-sm">
                {overdueList.length} student{overdueList.length !== 1 ? "s" : ""} have overdue fees
              </p>
              <p className="text-xs text-red-600/80">
                Send WhatsApp reminders to all of them in one click
              </p>
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shrink-0 shadow-sm" onClick={() => handleSendAll(overdueList as any[])}>
            <Send className="w-4 h-4 mr-2" /> Send All Reminders
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overdue" className="gap-2">
            Overdue
            {overdueList.length > 0 && <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">{overdueList.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="duesToday" className="gap-2">
            Due Today
            {dueList.length > 0 && <Badge className="h-5 min-w-5 px-1 text-xs bg-amber-500">{dueList.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Overdue Students</CardTitle>
              {!overdueLoading && overdueList.length > 0 && (
                <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => handleSendAll(overdueList as any[])}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Send All ({overdueList.length})
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {overdueLoading ? <Skeleton className="h-64 w-full" /> : <FeeTable students={overdueList as any[]} isOverdue={true} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duesToday">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Dues Expected Today</CardTitle>
              {!duesLoading && dueList.length > 0 && (
                <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => handleSendAll(dueList as any[])}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Remind All ({dueList.length})
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {duesLoading ? <Skeleton className="h-64 w-full" /> : <FeeTable students={dueList as any[]} isOverdue={false} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeeTable({ students, isOverdue }: { students: Student[], isOverdue: boolean }) {
  const queryClient = useQueryClient();
  const markPaid = useMarkFeePaid();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payingStudent, setPayingStudent] = useState<Student | null>(null);
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

  const handleMarkPaid = () => {
    if (!selectedStudent || !amount) return;
    const now = new Date();
    markPaid.mutate({
      data: { studentId: selectedStudent.id, amount: Number(amount), month: now.getMonth() + 1, year: now.getFullYear(), notes }
    }, {
      onSuccess: () => {
        toast.success(`Payment recorded for ${selectedStudent.name}`);
        setDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      },
      onError: () => toast.error("Failed to record payment")
    });
  };

  const handleRemind = (student: Student) => {
    if (openWhatsApp(student)) {
      setRemindedIds(prev => new Set([...prev, student.id]));
      toast.success(`WhatsApp opened for ${student.name}`);
    }
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 opacity-60" />
        <p className="font-medium text-sm">All clear! No students in this category.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Student</TableHead>
              <TableHead>Seat</TableHead>
              <TableHead>Due Date</TableHead>
              {isOverdue && <TableHead>Days Overdue</TableHead>}
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map(student => {
              const reminded = remindedIds.has(student.id);
              return (
                <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                        <span className="text-xs font-bold text-indigo-600">{student.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.phone}</div>
                        {(student as any).shifts && (student as any).shifts.length > 0 && (
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {(student as any).shifts.map((shift: string) => (
                              <span key={shift} className="text-[10px] px-1 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium capitalize">{shift}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">#{student.seatNumber}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {student.nextDueDate ? format(new Date(student.nextDueDate), "dd MMM, yyyy") : "—"}
                  </TableCell>
                  {isOverdue && (
                    <TableCell>
                      {student.nextDueDate ? (
                        <span className="text-destructive font-semibold text-sm">
                          {differenceInDays(new Date(), new Date(student.nextDueDate))} days
                        </span>
                      ) : "—"}
                    </TableCell>
                  )}
                  <TableCell className="font-semibold text-primary">₹{Number(student.monthlyFee).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant={reminded ? "secondary" : "outline"}
                        className={reminded ? "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}
                        onClick={() => handleRemind(student)} title="Send WhatsApp reminder">
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        {reminded ? "Sent ✓" : "Remind"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedStudent(student); setAmount(String(student.monthlyFee)); setNotes(""); setDialogOpen(true);
                      }}>Mark Paid</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Mark fees as paid for {selectedStudent?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Paid via UPI" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkPaid} disabled={markPaid.isPending || !amount}>
              {markPaid.isPending ? "Recording..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {payingStudent && <RecordPaymentDialog student={payingStudent} open={!!payingStudent} onClose={() => setPayingStudent(null)} />}
    </>
  );
}
