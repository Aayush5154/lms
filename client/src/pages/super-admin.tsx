import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, Building2, Plus, CheckCircle, XCircle, Trash2, KeyRound, Loader2, Users, Settings } from "lucide-react";
import { apiUrl } from "@/services/api-url";

async function superFetch(path: string, method = "GET", body?: unknown) {
  const token = localStorage.getItem("lms_token");
  const res = await fetch(apiUrl(`/api${path}`), {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
  return res.json();
}

interface LibraryForm { email: string; password: string; name: string; libraryName: string; totalSeats: string; }
const defaultLibForm: LibraryForm = { email: "", password: "", name: "", libraryName: "", totalSeats: "50" };

export default function SuperAdmin() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<LibraryForm>(defaultLibForm);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);
  const [newPwd, setNewPwd] = useState("");

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["superAdmins"],
    queryFn: () => superFetch("/super/admins"),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => superFetch("/super/libraries", "POST", data),
    onSuccess: () => { toast.success("Library created!"); setShowCreate(false); setForm(defaultLibForm); qc.invalidateQueries({ queryKey: ["superAdmins"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => superFetch(`/super/libraries/${id}/approve`, "PATCH"),
    onSuccess: () => { toast.success("Library approved"); qc.invalidateQueries({ queryKey: ["superAdmins"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => superFetch(`/super/libraries/${id}/suspend`, "PATCH"),
    onSuccess: () => { toast.success("Library suspended"); qc.invalidateQueries({ queryKey: ["superAdmins"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superFetch(`/super/libraries/${id}`, "DELETE"),
    onSuccess: () => { toast.success("Library deleted"); qc.invalidateQueries({ queryKey: ["superAdmins"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, pwd }: { id: string; pwd: string }) => superFetch(`/super/libraries/${id}/reset-password`, "PATCH", { newPassword: pwd }),
    onSuccess: () => { toast.success("Password reset"); setResetTarget(null); setNewPwd(""); },
    onError: (e: any) => toast.error(e.message),
  });

  const [editConfigTarget, setEditConfigTarget] = useState<{ id: string; name: string } | null>(null);
  const [configForm, setConfigForm] = useState({ theme: "light", websiteEnabled: true, websiteSlug: "" });

  const configMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => superFetch(`/super/libraries/${id}/config`, "PUT", data),
    onSuccess: () => { toast.success("Configuration updated"); setEditConfigTarget(null); qc.invalidateQueries({ queryKey: ["superAdmins"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const field = (key: keyof LibraryForm, label: string, type = "text", placeholder = "") => (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <Input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" /> Super Admin
          </h1>
          <p className="text-muted-foreground">Manage all libraries on the platform</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Library
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Building2 className="w-5 h-5 text-primary" />} label="Total Libraries" value={admins.length} />
        <StatCard icon={<CheckCircle className="w-5 h-5 text-green-500" />} label="Active" value={admins.filter((a: any) => a.isActive).length} />
        <StatCard icon={<XCircle className="w-5 h-5 text-red-500" />} label="Suspended" value={admins.filter((a: any) => !a.isActive).length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> All Libraries</CardTitle>
          <CardDescription>Manage library admin accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded" />)}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Library / Admin</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin: any) => (
                    <TableRow key={admin._id ?? admin.id}>
                      <TableCell>
                        <p className="font-medium">{admin.library?.libraryName ?? admin.libraryName}</p>
                        <p className="text-xs text-muted-foreground">{admin.name}</p>
                      </TableCell>
                      <TableCell className="text-sm">{admin.email}</TableCell>
                      <TableCell>{admin.library?.totalSeats ?? "—"}</TableCell>
                      <TableCell>
                        {admin.isActive
                          ? <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                          : <Badge variant="destructive">Suspended</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!admin.isActive
                            ? <Button variant="outline" size="sm" className="h-7 text-xs text-green-600 border-green-200"
                                onClick={() => approveMutation.mutate(admin._id ?? admin.id)} disabled={approveMutation.isPending}>
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </Button>
                            : <Button variant="outline" size="sm" className="h-7 text-xs text-yellow-600 border-yellow-200"
                                onClick={() => suspendMutation.mutate(admin._id ?? admin.id)} disabled={suspendMutation.isPending}>
                                <XCircle className="w-3 h-3 mr-1" /> Suspend
                              </Button>}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500"
                            onClick={() => { setResetTarget({ id: admin._id ?? admin.id, name: admin.name }); setNewPwd(""); }}>
                            <KeyRound className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-500"
                            onClick={() => { 
                              setEditConfigTarget({ id: admin._id ?? admin.id, name: admin.name }); 
                              setConfigForm({ 
                                theme: admin.library?.theme || "light", 
                                websiteEnabled: admin.library?.websiteEnabled ?? true, 
                                websiteSlug: admin.library?.websiteSlug || "" 
                              }); 
                            }}>
                            <Settings className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => { if (confirm(`Delete ${admin.name}?`)) deleteMutation.mutate(admin._id ?? admin.id); }}
                            disabled={deleteMutation.isPending}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {admins.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No libraries yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Library Dialog */}
      <Dialog open={showCreate} onOpenChange={open => { setShowCreate(open); if (!open) setForm(defaultLibForm); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Create New Library</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {field("libraryName", "Library Name *", "text", "e.g. City Study Library")}
            {field("name", "Admin Name *", "text", "e.g. Rajesh Kumar")}
            {field("email", "Admin Email *", "email", "admin@example.com")}
            {field("password", "Admin Password *", "password", "Min. 8 characters")}
            {field("totalSeats", "Total Seats", "number", "50")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ ...form, totalSeats: Number(form.totalSeats) })} disabled={createMutation.isPending}>
              {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Library"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Config Dialog */}
      <Dialog open={!!editConfigTarget} onOpenChange={open => !open && setEditConfigTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Configuration — {editConfigTarget?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Theme Mode</Label>
                <p className="text-xs text-muted-foreground">Force light or dark mode.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setConfigForm(f => ({ ...f, theme: f.theme === "light" ? "dark" : "light" }))}
              >
                {configForm.theme === "light" ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Public Website</Label>
                <p className="text-xs text-muted-foreground">Enable or disable public access.</p>
              </div>
              <input type="checkbox" checked={configForm.websiteEnabled} onChange={e => setConfigForm(f => ({ ...f, websiteEnabled: e.target.checked }))} className="w-4 h-4" />
            </div>
            <div className="space-y-2">
              <Label>Website Slug</Label>
              <Input value={configForm.websiteSlug} onChange={e => setConfigForm(f => ({ ...f, websiteSlug: e.target.value }))} placeholder="my-library-slug" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditConfigTarget(null)}>Cancel</Button>
            <Button onClick={() => configMutation.mutate({ id: editConfigTarget!.id, data: configForm })} disabled={configMutation.isPending}>
              {configMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
