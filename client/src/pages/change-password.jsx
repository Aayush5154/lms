import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "@/services/api-url";
function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Both passwords are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsPending(true);
    try {
      const token = localStorage.getItem("lms_token");
      const res = await fetch(apiUrl("/api/auth/change-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password");
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsPending(false);
    }
  };
  return <div className="space-y-6 max-w-md mx-auto page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50"><KeyRound className="w-5 h-5 text-indigo-600" /></div>
          Change Password
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 ml-[52px]">Update your admin credentials</p>
      </div>

      <Card className="card-shadow card-enter card-enter-delay-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-indigo-50"><KeyRound className="w-4 h-4 text-indigo-600" /></div>
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full shadow-sm btn-press" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
}
export {
  ChangePassword as default
};
