import { useState, useEffect } from "react";
import { useGetLibraryConfig, useUpdateLibraryConfig } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Trash2, Save, Check, X, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Plans() {
  const { data: config, isLoading, refetch } = useGetLibraryConfig();
  const updateConfig = useUpdateLibraryConfig();

  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (config) {
      if ((config as any).membershipPlans && (config as any).membershipPlans.length > 0) {
        setPlans((config as any).membershipPlans);
      } else {
        // Default plans if none exist
        setPlans([
          { name: "Basic", price: String((config as any).monthlyFeeDefault || 1000), description: "Perfect for part-time learners.", features: ["Flexible Seating", "High-Speed WiFi", "RO Water"], recommended: false },
          { name: "Premium", price: String(((config as any).monthlyFeeDefault || 1000) * 2), description: "For dedicated students.", features: ["Reserved Cabin Seat", "24/7 Access", "Unlimited Coffee", "Discussion Room"], recommended: true },
          { name: "Standard", price: String(Math.round(((config as any).monthlyFeeDefault || 1000) * 1.5)), description: "The balanced everyday plan.", features: ["Dedicated Desk", "High-Speed WiFi", "Power Backup"], recommended: false }
        ]);
      }
    }
  }, [config]);

  const handleAddPlan = () => {
    setPlans([...plans, { name: "New Plan", price: "0", description: "", features: [], recommended: false }]);
  };

  const handleRemovePlan = (index: number) => {
    setPlans(plans.filter((_, i) => i !== index));
  };

  const handlePlanChange = (index: number, field: string, value: any) => {
    const newPlans = [...plans];
    newPlans[index][field] = value;
    // Ensure only one recommended plan
    if (field === "recommended" && value === true) {
      newPlans.forEach((p, i) => { if (i !== index) p.recommended = false; });
    }
    setPlans(newPlans);
  };

  const handleAddFeature = (planIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex].features.push("New Feature");
    setPlans(newPlans);
  };

  const handleFeatureChange = (planIndex: number, featureIndex: number, value: string) => {
    const newPlans = [...plans];
    newPlans[planIndex].features[featureIndex] = value;
    setPlans(newPlans);
  };

  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex].features.splice(featureIndex, 1);
    setPlans(newPlans);
  };

  const handleSave = () => {
    // Strip any Mongoose-injected _id fields from plans before sending
    const cleanPlans = plans.map(({ _id, ...rest }: any) => ({
      name: rest.name,
      price: rest.price,
      description: rest.description,
      features: rest.features,
      recommended: rest.recommended,
    }));
    updateConfig.mutate(
      { data: { membershipPlans: cleanPlans } as any },
      {
        onSuccess: () => {
          toast.success("Membership plans saved successfully");
          refetch();
        },
        onError: (err: any) => toast.error(err.response?.data?.error || err.message || "Failed to save plans"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Membership Plans</h1>
          <p className="text-muted-foreground">Manage your library's pricing tiers and included facilities.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleAddPlan}>
            <Plus className="w-4 h-4 mr-2" /> Add Plan
          </Button>
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateConfig.isPending ? "Saving..." : "Save Plans"}
          </Button>
        </div>
      </div>

      {plans.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center bg-muted/20">
          <CardTitle className="mb-2 text-xl">No Plans Configured</CardTitle>
          <CardDescription className="mb-6">Add your first membership plan to display on the public website.</CardDescription>
          <Button onClick={handleAddPlan}><Plus className="w-4 h-4 mr-2" /> Create First Plan</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <Card key={i} className={`relative flex flex-col ${plan.recommended ? 'border-primary shadow-md' : ''}`}>
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-current" /> Recommended
                </div>
              )}
              <CardHeader className="pb-4 pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1 w-full mr-2">
                    <Label className="text-xs text-muted-foreground">Plan Name</Label>
                    <Input 
                      value={plan.name} 
                      onChange={(e) => handlePlanChange(i, "name", e.target.value)} 
                      className="font-bold text-lg h-9"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleRemovePlan(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Price</Label>
                  <Input 
                    value={plan.price} 
                    onChange={(e) => handlePlanChange(i, "price", e.target.value)} 
                    placeholder="e.g. ₹2000/mo"
                    className="font-mono text-base h-9 text-primary font-semibold"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <textarea
                    rows={2}
                    value={plan.description}
                    onChange={(e) => handlePlanChange(i, "description", e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Short description..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Facilities Included</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handleAddFeature(i)}>
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {plan.features.map((feat: string, j: number) => (
                      <div key={j} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <Input 
                          value={feat} 
                          onChange={(e) => handleFeatureChange(i, j, e.target.value)} 
                          className="h-7 text-sm"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0" onClick={() => handleRemoveFeature(i, j)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {plan.features.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-md">
                        No facilities added
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                  <Label className="text-sm cursor-pointer" htmlFor={`rec-${i}`}>Highlight as Recommended</Label>
                  <Switch 
                    id={`rec-${i}`} 
                    checked={plan.recommended} 
                    onCheckedChange={(checked) => handlePlanChange(i, "recommended", checked)} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
