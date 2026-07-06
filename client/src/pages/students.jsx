import { useMemo, useState, useEffect, useRef } from "react";
import { useListStudents, useDeleteStudent, useCreateStudent, useUpdateStudent } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Eye, Trash2, Loader2, Users, CreditCard, Edit, Phone, Mail, Calendar, X } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const defaultForm = {
  name: "",
  phone: "",
  fatherName: "",
  seatNumber: "",
  joiningDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
  monthlyFee: "800",
  feeDueDate: "1",
  feeStatus: "paid",
  shifts: [],
  notes: "",
  whatsappNumber: ""
};
function Students() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [payingStudent, setPayingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useListStudents({ search }, { query: { queryKey: ["students", search] } });
  const deleteMutation = useDeleteStudent();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const [editingStudent, setEditingStudent] = useState(null);
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      phone: student.phone,
      fatherName: student.fatherName,
      seatNumber: String(student.seatNumber),
      joiningDate: student.joiningDate ? student.joiningDate.split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      monthlyFee: String(student.monthlyFee),
      feeDueDate: String(student.feeDueDate),
      feeStatus: student.feeStatus,
      shifts: student.shifts || [],
      notes: student.notes || "",
      whatsappNumber: student.whatsappNumber || ""
    });
    setFormErrors({});
  };
  const students = data?.students ?? [];
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (students.length > 0 && !selectedStudent && !isLoading && !hasAutoSelected.current) {
      setSelectedStudent(students[0]);
      hasAutoSelected.current = true;
    }
  }, [students, selectedStudent, isLoading]);
  const filtered = useMemo(() => students.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search) || String(s.seatNumber).includes(search);
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? s.isActive : !s.isActive);
    return matchSearch && matchStatus;
  }), [students, search, statusFilter]);
  const validate = () => {
    const errors = {};
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
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      fatherName: form.fatherName.trim(),
      seatNumber: Number(form.seatNumber),
      joiningDate: form.joiningDate,
      monthlyFee: Number(form.monthlyFee),
      feeDueDate: Number(form.feeDueDate) || 1,
      feeStatus: form.feeStatus,
      shifts: form.shifts.length > 0 ? form.shifts : void 0,
      notes: form.notes || void 0,
      whatsappNumber: form.whatsappNumber || void 0
    };
    if (editingStudent) {
      updateMutation.mutate({
        id: editingStudent.id,
        data: payload
      }, {
        onSuccess: (updatedStudent) => {
          toast.success("Student updated successfully!");
          setEditingStudent(null);
          setForm(defaultForm);
          setFormErrors({});
          if (selectedStudent?.id === editingStudent.id) {
            setSelectedStudent(updatedStudent);
          }
          queryClient.invalidateQueries({ queryKey: ["students"] });
          queryClient.invalidateQueries({ queryKey: ["/api/students"] });
          queryClient.invalidateQueries({ queryKey: ["/api/seats"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        },
        onError: (err) => {
          toast.error(err?.response?.data?.error ?? "Failed to update student");
        }
      });
    } else {
      createMutation.mutate({
        data: payload
      }, {
        onSuccess: () => {
          toast.success("Student added successfully!");
          setShowAdd(false);
          setForm(defaultForm);
          setFormErrors({});
          queryClient.invalidateQueries({ queryKey: ["students"] });
          queryClient.invalidateQueries({ queryKey: ["/api/students"] });
          queryClient.invalidateQueries({ queryKey: ["/api/seats"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        },
        onError: (err) => {
          toast.error(err?.response?.data?.error ?? "Failed to add student");
        }
      });
    }
  };
  const handleDelete = (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Student removed");
        if (selectedStudent?.id === id) setSelectedStudent(null);
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/seats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      },
      onError: () => toast.error("Failed to delete student")
    });
  };
  const field = (key, label, type = "text", placeholder = "") => <div className="space-y-1.5">
      <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
      <Input
    id={key}
    type={type}
    placeholder={placeholder}
    value={form[key]}
    onChange={(e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setFormErrors((fe) => ({ ...fe, [key]: "" }));
    }}
    className={formErrors[key] ? "border-destructive focus-visible:ring-destructive" : ""}
  />
      {formErrors[key] && <p className="text-xs text-destructive">{formErrors[key]}</p>}
    </div>;
  return <div className="space-y-6 max-w-[1600px] mx-auto page-enter pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all registered students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {
    /* Left Column - Table */
  }
        <div className="xl:col-span-2 space-y-4">
          <Card className="card-shadow card-enter card-enter-delay-1 border-border">
            <CardHeader className="pb-4 pt-5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
              <div className="flex items-center gap-3 flex-1 w-full">
                <div className="relative flex-1 max-w-[240px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
    placeholder="Search students..."
    className="pl-9 bg-muted/30 border-border h-9 text-sm"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] h-9 text-sm bg-muted/30 border-border">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="h-9 text-sm bg-muted/30 border-border hidden md:flex">
                  All Courses
                </Button>
                <Button variant="outline" className="h-9 text-sm bg-muted/30 border-border hidden md:flex">
                  All Plans
                </Button>
              </div>
              <Button onClick={() => setShowAdd(true)} className="shadow-sm btn-press h-9 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                <UserPlus className="w-4 h-4 mr-2" /> Add Student
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? <div className="p-5 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div> : <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/10 border-b border-border hover:bg-muted/10">
                        <TableHead className="font-semibold text-muted-foreground h-11 px-5">Student</TableHead>
                        <TableHead className="font-semibold text-muted-foreground h-11">Phone</TableHead>
                        <TableHead className="font-semibold text-muted-foreground h-11">Course</TableHead>
                        <TableHead className="font-semibold text-muted-foreground h-11">Seat No.</TableHead>
                        <TableHead className="font-semibold text-muted-foreground h-11">Plan</TableHead>
                        <TableHead className="font-semibold text-muted-foreground h-11">Status</TableHead>
                        <TableHead className="font-semibold text-muted-foreground h-11">Joined On</TableHead>
                        <TableHead className="text-right font-semibold text-muted-foreground h-11 px-5">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((student, i) => <TableRow
    key={student.id}
    className={`table-row-hover cursor-pointer border-b border-border/50 ${selectedStudent?.id === student.id ? "bg-indigo-50/50 dark:bg-indigo-500/5" : ""}`}
    onClick={() => setSelectedStudent(student)}
  >
                          <TableCell className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200 shrink-0">
                                {student.photoUrl ? <img src={student.photoUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-indigo-700">{student.name.substring(0, 2).toUpperCase()}</span>}
                              </div>
                              <span className="font-medium text-sm text-foreground">{student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">{student.phone}</TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">
                            {student.shifts && student.shifts.length > 0 ? student.shifts[0].toUpperCase() : "General"}
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="font-semibold text-sm text-foreground">{student.seatNumber}</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">Monthly</TableCell>
                          <TableCell className="py-3">
                            {student.isActive ? <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none font-medium h-6">Active</Badge> : <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 shadow-none font-medium h-6">Inactive</Badge>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">
                            {format(new Date(student.joiningDate), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-right px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => {
    e.stopPropagation();
    setSelectedStudent(student);
  }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => {
    e.stopPropagation();
    handleEditClick(student);
  }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
    variant="ghost"
    size="icon"
    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(student.id, student.name);
    }}
    disabled={deleteMutation.isPending}
  >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>)}
                      {filtered.length === 0 && <TableRow>
                          <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                            {search || statusFilter !== "all" ? "No students match your filters" : "No students yet \u2014 add one to get started"}
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                  
                  {filtered.length > 0 && <div className="flex items-center justify-between px-5 py-4 border-t border-border/50 text-sm text-muted-foreground">
                      <div>Showing 1 to {filtered.length} of {filtered.length} entries</div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-muted/20 border-border" disabled>&lt;</Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-indigo-600 text-white border-indigo-600">1</Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-md bg-muted/20 border-border" disabled>&gt;</Button>
                      </div>
                    </div>}
                </div>}
            </CardContent>
          </Card>
        </div>

        {
    /* Right Column - Profile Sidebar */
  }
        <div className="xl:col-span-1">
          <Card className="card-shadow card-enter card-enter-delay-2 h-full border-border sticky top-6">
            <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-border/50">
              <CardTitle className="text-base font-bold">Student Profile</CardTitle>
              <div className="flex items-center gap-1">
                {selectedStudent && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(selectedStudent)} title="Edit Student">
                    <Edit className="w-4 h-4" />
                  </Button>}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setSelectedStudent(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectedStudent ? <div className="animate-in fade-in zoom-in-95 duration-200">
                  {
    /* Profile Header */
  }
                  <div className="p-6 flex items-start gap-4 border-b border-border/50">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                      {selectedStudent.photoUrl ? <img src={selectedStudent.photoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-indigo-700">{selectedStudent.name.substring(0, 2).toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-foreground truncate">{selectedStudent.name}</h2>
                        {selectedStudent.isActive ? <Badge className="bg-emerald-500/10 text-emerald-600 border-none shadow-none font-medium h-5 px-1.5 text-[10px]">Active</Badge> : <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-none shadow-none font-medium h-5 px-1.5 text-[10px]">Inactive</Badge>}
                      </div>
                      <div className="space-y-1.5 mt-2">
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <Phone className="w-3 h-3" /> {selectedStudent.phone}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <Mail className="w-3 h-3" /> {selectedStudent.name.toLowerCase().replace(" ", "")}@gmail.com
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <Calendar className="w-3 h-3" /> Joined on {format(new Date(selectedStudent.joiningDate), "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {
    /* Profile Tabs */
  }
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-transparent border-b border-border w-full justify-start h-12 p-0 rounded-none px-6 space-x-6 overflow-x-auto no-scrollbar">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-0 py-3.5 font-medium text-muted-foreground hover:text-foreground text-sm">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="seat" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-0 py-3.5 font-medium text-muted-foreground hover:text-foreground text-sm">
                        Seat Details
                      </TabsTrigger>
                      <TabsTrigger value="fee" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-0 py-3.5 font-medium text-muted-foreground hover:text-foreground text-sm">
                        Fee Details
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="p-6 m-0 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground">Personal Information</h3>
                        <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-sm">
                          <div className="text-muted-foreground">Father's Name</div>
                          <div className="col-span-2 font-medium text-foreground">{selectedStudent.fatherName || "\u2014"}</div>
                          
                          <div className="text-muted-foreground">Date of Birth</div>
                          <div className="col-span-2 font-medium text-foreground">15 Aug 2001</div>
                          
                          <div className="text-muted-foreground">Address</div>
                          <div className="col-span-2 font-medium text-foreground">123 Main Street, Jaipur, Rajasthan</div>
                          
                          <div className="text-muted-foreground">Course</div>
                          <div className="col-span-2 font-medium text-foreground">{selectedStudent.shifts && selectedStudent.shifts.length > 0 ? selectedStudent.shifts[0].toUpperCase() : "UPSC"}</div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <h3 className="text-sm font-bold text-foreground">Plan Information</h3>
                        <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-sm">
                          <div className="text-muted-foreground">Plan</div>
                          <div className="col-span-2 font-medium text-foreground">Monthly</div>
                          
                          <div className="text-muted-foreground">Monthly Fee</div>
                          <div className="col-span-2 font-medium text-foreground">₹{Number(selectedStudent.monthlyFee).toLocaleString()}</div>
                          
                          <div className="text-muted-foreground">Next Due Date</div>
                          <div className="col-span-2 font-medium text-foreground">{selectedStudent.nextDueDate ? format(new Date(selectedStudent.nextDueDate), "dd MMM, yyyy") : "\u2014"}</div>
                          
                          <div className="text-muted-foreground">Payment Status</div>
                          <div className="col-span-2">
                            {selectedStudent.feeStatus === "paid" ? <Badge className="bg-emerald-50 text-emerald-700 border-none shadow-none font-medium h-5 px-1.5 text-[10px]">Paid</Badge> : selectedStudent.feeStatus === "overdue" ? <Badge variant="destructive" className="border-none shadow-none font-medium h-5 px-1.5 text-[10px]">Overdue</Badge> : <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none shadow-none font-medium h-5 px-1.5 text-[10px]">Pending</Badge>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                         <Button onClick={() => setPayingStudent(selectedStudent)} className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none shadow-none">
                           <CreditCard className="w-4 h-4 mr-2" /> Record Payment
                         </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="seat" className="p-6 m-0 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground">Seat Assignment</h3>
                        <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-sm">
                          <div className="text-muted-foreground">Seat Number</div>
                          <div className="col-span-2 font-medium text-foreground">
                            <Badge variant="outline" className="font-bold text-indigo-600 bg-indigo-50 border-indigo-200">
                              #{selectedStudent.seatNumber}
                            </Badge>
                          </div>
                          
                          <div className="text-muted-foreground">Assigned Shifts</div>
                          <div className="col-span-2 font-medium text-foreground">
                            {selectedStudent.shifts && selectedStudent.shifts.length > 0 ? <div className="flex gap-1.5 flex-wrap">
                                {selectedStudent.shifts.map((shift) => <Badge key={shift} className="bg-muted text-muted-foreground hover:bg-muted capitalize text-xs shadow-none border-none">
                                    {shift}
                                  </Badge>)}
                              </div> : "\u2014"}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="fee" className="p-6 m-0 space-y-6">
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <CreditCard className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-sm font-medium">Fee History</p>
                        <p className="text-xs opacity-70 text-center mt-1">To view full payment history and print receipts, go to the detailed profile.</p>
                        <Button variant="outline" size="sm" className="mt-4" asChild>
                          <Link href={`/students/${selectedStudent.id}`}>View Full Profile</Link>
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div> : <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-6">
                  <Users className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Select a student</p>
                  <p className="text-xs opacity-70 text-center mt-1">Click on a student row to view their complete profile details</p>
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {
    /* Add/Edit Student Dialog */
  }
      <Dialog open={showAdd || !!editingStudent} onOpenChange={(open) => {
    if (!open) {
      setShowAdd(false);
      setEditingStudent(null);
      setForm(defaultForm);
      setFormErrors({});
    }
  }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50">
                {editingStudent ? <Edit className="w-4 h-4 text-indigo-600" /> : <UserPlus className="w-4 h-4 text-indigo-600" />}
              </div>
              {editingStudent ? "Edit Student Details" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {field("name", "Full Name *", "text", "e.g. Rahul Sharma")}
            {field("phone", "Phone Number *", "tel", "e.g. 9876543210")}
            {field("fatherName", "Father's Name *", "text", "e.g. Rajesh Sharma")}
            {field("whatsappNumber", "WhatsApp Number", "tel", "If different from phone")}
            {field("seatNumber", "Seat Number *", "number", "e.g. 1")}
            {field("joiningDate", "Joining Date *", "date")}
            {field("monthlyFee", "Monthly Fee (\u20B9) *", "number", "e.g. 800")}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Fee Due Date *</Label>
              <Select value={form.feeDueDate} onValueChange={(v) => setForm((f) => ({ ...f, feeDueDate: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <SelectItem key={d} value={String(d)}>Day {d} of month</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Initial Fee Status</Label>
              <Select value={form.feeStatus} onValueChange={(v) => setForm((f) => ({ ...f, feeStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm font-medium">Shifts</Label>
              <div className="flex flex-wrap gap-3 p-3 border rounded-lg bg-muted/20">
                {["morning", "day", "full", "night"].map((shift) => <label key={shift} className="flex items-center gap-2 cursor-pointer transition-smooth hover:opacity-80">
                    <input
    type="checkbox"
    checked={form.shifts.includes(shift)}
    onChange={(e) => {
      if (e.target.checked) {
        setForm((f) => ({ ...f, shifts: [...f.shifts, shift] }));
      } else {
        setForm((f) => ({ ...f, shifts: f.shifts.filter((s) => s !== shift) }));
      }
    }}
    className="w-4 h-4 rounded border-gray-300"
  />
                    <span className="text-sm capitalize">{shift}</span>
                  </label>)}
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <Input
    id="notes"
    placeholder="Optional notes..."
    value={form.notes}
    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
  />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
    setShowAdd(false);
    setEditingStudent(null);
    setForm(defaultForm);
    setFormErrors({});
  }} className="btn-press">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white">
              {createMutation.isPending || updateMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingStudent ? "Saving..." : "Adding..."}</> : <>{editingStudent ? <Edit className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />} {editingStudent ? "Save Changes" : "Add Student"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {payingStudent && <RecordPaymentDialog student={payingStudent} open={!!payingStudent} onClose={() => setPayingStudent(null)} />}
    </div>;
}
export {
  Students as default
};
