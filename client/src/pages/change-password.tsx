import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChangePassword() {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Change Password</h1>
        <p className="text-muted-foreground">Update your admin credentials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
             <label className="text-sm font-medium">Current Password</label>
             <Input type="password" placeholder="••••••••" className="mt-1" />
           </div>
           <div>
             <label className="text-sm font-medium">New Password</label>
             <Input type="password" placeholder="••••••••" className="mt-1" />
           </div>
           <Button className="w-full">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
