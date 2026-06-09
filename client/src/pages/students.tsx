import { useMemo, useState } from "react";
import { useListStudents, useDeleteStudent, useCreateStudent } from "@workspace/api-client-react";
import type { Student } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Eye, Trash2, Loader2, Users, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";

interface StudentForm {
  name: string;
  phone: string;
  fatherName: string;
  seatNumber: string;
  joiningDate: string;
  monthlyFee: string;
  feeDueDate: string;
  feeStatus: string;
  shifts: string[];
  notes: string;
  whatsappNumber: string;
}

const defaultForm: StudentForm = {
  name: "", phone: "", fatherName: "", seatNumber: "",
  joiningDate: new Date().toISOString().split("T")[0]!,
  monthlyFee: "800", feeDueDate: "1", feeStatus: "unpaid", shifts: [], notes: "", whatsappNumber: "",
};

export default function Students() {
  const [search, setSearch] = useState("");
  const [feeFilter, setFeeFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<StudentForm>(defaultForm);
  const [formErrors, setFormErrors] = useState<Partial<StudentForm>>({});
  const [payingStudent, setPayingStudent] = useState<Student | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading } = useListStudents({ search, feeStatus: feeFilter !== "all" ? feeFilter as any : undefined }, { query: { queryKey: ["students", search, feeFilter] } });
  const deleteMutation = useDeleteStudent();
  const createMutation = useCreateStudent();

  const students = data?.students ?? [];
  const filtered = useMemo(() => students.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      String(s.seatNumber).includes(search);
    const matchFee = feeFilter === "all" || s.feeStatus === feeFilter;
    return matchSearch && matchFee;
  }), [students, search, feeFilter]);

  const validate = (): boolean => {
    const errors: Partial<StudentForm> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.phone.trim()) errors.phone = "Phone is required";
    if (!form.fatherName.trim()) errors.fatherName = "Father's name is required";
    if (!form.seatNumber || isNaN(Number(form.seatNumber)) || Number(form.seatNumber) < 1)
      errors.seatNumber = "Valid seat number required";
    if (!form.joiningDate) errors.joiningDate = "Joining date is required";
    if (!form.monthlyFee || isNaN(Number(form.monthlyFee)) || Number(form.monthlyFee) <= 0)
      errors.monthlyFee = "Valid monthly fee required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createMutation.mutate({
      data: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        fatherName: form.fatherName.trim(),
        seatNumber: Number(form.seatNumber),
        joiningDate: form.joiningDate,
        monthlyFee: Number(form.monthlyFee),
        feeDueDate: Number(form.feeDueDate) || 1,
        feeStatus: form.feeStatus,
        shifts: form.shifts.length > 0 ? form.shifts : undefined,
        notes: form.notes || undefined,
        whatsappNumber: form.whatsappNumber || undefined,
      } as any,
    }, {
      onSuccess: () => {
        toast.success("Student added successfully!");
        setShowAdd(false);
        setForm(defaultForm);
        setFormErrors({});
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/seats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error ?? "Failed to add student";
        toast.error(msg);
      },
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Student removed");
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/seats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      },
      onError: () => toast.error("Failed to delete student"),
    });
  };

  const field = (key: keyof StudentForm, label: string, type = "text", placeholder = "") => (
    <div className="space-y-1">
      <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
      <Input
        id={key} type={type} placeholder={placeholder}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setFormErrors(fe => ({ ...fe, [key]: "" })); }}
        className={formErrors[key] ? "border-destructive" : ""}
      />
      {formErrors[key] && <p className="text-xs text-destructive">{formErrors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Students
          </h1>
          <p className="text-muted-foreground">Manage library members and their details</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, phone or seat..." className="pl-9"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={feeFilter} onValueChange={setFeeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Fee Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(student => (
                    <TableRow key={student.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 shrink-0">
                            {student.photoUrl
                              ? <img src={student.photoUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                              : <span className="text-xs font-bold text-primary">{student.name.substring(0, 2).toUpperCase()}</span>}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{(student as any).fatherName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-mono font-semibold text-sm bg-muted px-2 py-0.5 rounded">#{student.seatNumber}</span></TableCell>
                      <TableCell className="text-sm">{student.phone}</TableCell>
                      <TableCell className="text-sm font-medium">₹{Number(student.monthlyFee).toLocaleString()}</TableCell>
                      <TableCell>
                        {student.feeStatus === "paid"
                          ? <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Paid</Badge>
                          : student.feeStatus === "overdue"
                          ? <Badge variant="destructive">Overdue</Badge>
                          : <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">Unpaid</Badge>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {student.nextDueDate ? format(new Date(student.nextDueDate), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Record Payment"
                            onClick={() => setPayingStudent(student)}
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/students/${student.id}`}><Eye className="w-4 h-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(student.id, student.name)}
                            disabled={deleteMutation.isPending}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        {search || feeFilter !== "all" ? "No students match your filters" : "No students yet — add one to get started"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={showAdd} onOpenChange={open => { setShowAdd(open); if (!open) { setForm(defaultForm); setFormErrors({}); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Add New Student
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {field("name", "Full Name *", "text", "e.g. Rahul Sharma")}
            {field("phone", "Phone Number *", "tel", "e.g. 9876543210")}
            {field("fatherName", "Father's Name *", "text", "e.g. Rajesh Sharma")}
            {field("whatsappNumber", "WhatsApp Number", "tel", "If different from phone")}
            {field("seatNumber", "Seat Number *", "number", "e.g. 1")}
            {field("joiningDate", "Joining Date *", "date")}
            {field("monthlyFee", "Monthly Fee (₹) *", "number", "e.g. 800")}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Fee Due Date *</Label>
              <Select value={form.feeDueDate} onValueChange={v => setForm(f => ({ ...f, feeDueDate: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <SelectItem key={d} value={String(d)}>Day {d} of month</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Initial Fee Status</Label>
              <Select value={form.feeStatus} onValueChange={v => setForm(f => ({ ...f, feeStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-sm font-medium">Shifts</Label>
              <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-muted/30">
                {["morning", "day", "full", "night"].map(shift => (
                  <label key={shift} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.shifts.includes(shift)}
                      onChange={e => {
                        if (e.target.checked) {
                          setForm(f => ({ ...f, shifts: [...f.shifts, shift] }));
                        } else {
                          setForm(f => ({ ...f, shifts: f.shifts.filter(s => s !== shift) }));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">{shift}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <Input id="notes" placeholder="Optional notes..." value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowAdd(false); setForm(defaultForm); setFormErrors({}); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : <><UserPlus className="w-4 h-4 mr-2" /> Add Student</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      {payingStudent && (
        <RecordPaymentDialog
          student={payingStudent}
          open={!!payingStudent}
          onClose={() => setPayingStudent(null)}
        />
      )}
    </div>
  );
}
