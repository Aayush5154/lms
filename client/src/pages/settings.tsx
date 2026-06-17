import { useState, useEffect, useRef } from "react";
import { useGetLibraryConfig, useUpdateLibraryConfig } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, ExternalLink, RefreshCw, Palette, Building2, Save, Monitor, ImagePlus, MapPin, Upload, X, Images, Settings as SettingsIcon } from "lucide-react";
import { uploadFile } from "@/services/upload";
import { ThemeToggle } from "@/layouts/ThemeToggle";
import { LanguageToggle } from "@/layouts/LanguageToggle";
import { WEBSITE_THEMES, getTheme } from "@/utils/websiteThemes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  const { data: config, isLoading, refetch } = useGetLibraryConfig();
  const updateConfig = useUpdateLibraryConfig();
  const [slugInput, setSlugInput] = useState("");
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const [form, setForm] = useState({
    libraryName: "", totalSeats: "", whatsappNumber: "", phone: "", email: "", address: "", city: "", state: "", pincode: "",
    ownerName: "", openingTime: "", closingTime: "", description: "", googleMapsLink: "", facilities: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const galleryReplaceRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (config) {
      setForm({
        libraryName: (config as any).libraryName || "", totalSeats: String((config as any).totalSeats || ""),
        whatsappNumber: (config as any).whatsappNumber || "", phone: (config as any).phone || "", email: (config as any).email || "",
        address: (config as any).address || "", city: (config as any).city || "", state: (config as any).state || "", pincode: (config as any).pincode || "",
        ownerName: (config as any).ownerName || "", openingTime: (config as any).openingTime || "",
        closingTime: (config as any).closingTime || "", description: (config as any).description || "",
        googleMapsLink: (config as any).googleMapsLink || "",
        facilities: ((config as any).facilities || []).join(", "),
      });
      if ((config as any).logoUrl) setLogoPreview((config as any).logoUrl);
      if ((config as any).coverImageUrl) setCoverPreview((config as any).coverImageUrl);
      if ((config as any).galleryImages?.length) setGalleryPreviews((config as any).galleryImages);
    }
  }, [config]);

  const handleUpdate = (updates: any, successMessage = "Settings updated") => {
    updateConfig.mutate({ data: updates }, {
      onSuccess: () => toast.success(successMessage),
      onError: (err: any) => toast.error(err.response?.data?.error || "Update failed"),
    });
  };

  const handleSaveLibraryInfo = () => {
    if (!form.libraryName.trim()) { toast.error("Library name is required"); return; }
    const seats = Number(form.totalSeats);
    if (isNaN(seats) || seats < 1) { toast.error("Please enter a valid number of seats"); return; }
    handleUpdate({
      libraryName: form.libraryName.trim(), totalSeats: seats,
      whatsappNumber: form.whatsappNumber.trim() || undefined, phone: form.phone.trim() || undefined, email: form.email.trim() || undefined,
      address: form.address.trim() || undefined, city: form.city.trim() || undefined, state: form.state.trim() || undefined, pincode: form.pincode.trim() || undefined, 
      ownerName: form.ownerName.trim() || undefined,
      openingTime: form.openingTime.trim() || undefined, closingTime: form.closingTime.trim() || undefined,
      description: form.description.trim() || undefined, googleMapsLink: form.googleMapsLink.trim() || undefined,
      facilities: form.facilities.split(",").map(f => f.trim()).filter(Boolean),
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { setPhotoUploading(true); await uploadFile("logo", file); toast.success("Logo Uploaded Successfully"); refetch(); }
    catch { toast.error("Logo upload failed"); } finally { setPhotoUploading(false); }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { setPhotoUploading(true); await uploadFile("cover", file); toast.success("Cover Image Uploaded Successfully"); refetch(); }
    catch { toast.error("Cover upload failed"); } finally { setPhotoUploading(false); }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setPhotoUploading(true);
    try { for (const file of files) { await uploadFile("gallery", file, "files"); } toast.success(`${files.length} photo(s) added to gallery!`); refetch(); }
    catch { toast.error("Failed to read image files"); } finally { setPhotoUploading(false); }
  };

  const handleGalleryReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || replaceIndex === null) return;
    setPhotoUploading(true);
    try { await uploadFile(`gallery?replaceIndex=${replaceIndex}`, file, "files"); toast.success("Gallery photo replaced!"); refetch(); }
    catch { toast.error("Failed to replace photo"); }
    finally { setPhotoUploading(false); setReplaceIndex(null); if (galleryReplaceRef.current) galleryReplaceRef.current.value = ''; }
  };

  const removeGalleryImage = (idx: number) => {
    const updated = galleryPreviews.filter((_, i) => i !== idx);
    setGalleryPreviews(updated);
    updateConfig.mutate({ data: { galleryImages: updated } }, {
      onSuccess: () => toast.success("Gallery image removed"),
      onError: (err: any) => toast.error(err.response?.data?.error || "Remove failed"),
    });
  };

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const copyLink = async (slug: string) => {
    const url = `${baseUrl}/library/${slug}`;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url); }
      else {
        const textArea = document.createElement("textarea"); textArea.value = url;
        textArea.style.position = "absolute"; textArea.style.left = "-999999px";
        document.body.prepend(textArea); textArea.select();
        try { document.execCommand("copy"); } catch { toast.error("Failed to copy link"); return; } finally { textArea.remove(); }
      }
      toast.success("Link copied to clipboard!");
    } catch { toast.error("Failed to copy link"); }
  };

  const openWebsite = (slug: string) => { window.open(`${baseUrl}/library/${slug}`, "_blank"); };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "", required = false) => (
    <div className="space-y-1.5">
      <Label htmlFor={key} className="text-sm font-semibold text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input id={key} type={type} placeholder={placeholder} value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="bg-transparent border-border shadow-sm h-10" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your library preferences and system settings</p>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="bg-transparent border-b border-border w-full justify-start h-auto p-0 rounded-none mb-6 sm:mb-8 flex-nowrap space-x-4 sm:space-x-8 overflow-x-auto no-scrollbar pb-px">
          <TabsTrigger value="library" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0 text-sm sm:text-base">
            Library Information
          </TabsTrigger>
          <TabsTrigger value="photos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0 text-sm sm:text-base">
            Website Photos
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0 text-sm sm:text-base">
            Appearance & Localisation
          </TabsTrigger>
          <TabsTrigger value="public" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0 text-sm sm:text-base">
            Public Website
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {field("libraryName", "Library Name", "text", "e.g. LMS Platform", true)}
                {field("totalSeats", "Total Seats", "number", "e.g. 120", true)}
                {field("ownerName", "Owner Name", "text", "e.g. Rahul Sharma")}
                {field("phone", "Phone Number", "tel", "e.g. 9876543210")}
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="whatsappNumber" className="text-sm font-semibold text-foreground">WhatsApp Number</Label>
                  <Input id="whatsappNumber" type="tel" placeholder="e.g. 9876543210" value={form.whatsappNumber}
                    onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))} className="bg-transparent border-border shadow-sm h-10" />
                  <p className="text-[11px] text-muted-foreground mt-1">Use WhatsApp number for Join Today and Enquiry Now</p>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</Label>
                  <Input id="email" type="email" placeholder="e.g. info@lmsplatform.com" value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="bg-transparent border-border shadow-sm h-10" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-semibold text-foreground">Address</Label>
                  <Input id="address" type="text" placeholder="e.g. 123 Main Street" value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="bg-transparent border-border shadow-sm h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {field("city", "City", "text", "e.g. Jaipur")}
                {field("state", "State", "text", "e.g. Rajasthan")}
                {field("pincode", "Pincode", "text", "e.g. 302001")}
              </div>

              {/* Cover / Hero Image Inline */}
              <div className="space-y-3 pt-6 border-t border-border">
                <Label className="text-sm font-semibold text-foreground">Cover / Hero Image</Label>
                <div className="relative w-full h-48 rounded-xl border border-border flex flex-col items-center justify-center bg-muted/20 overflow-hidden shadow-sm">
                  {coverPreview ? <img src={coverPreview} alt="Cover" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50"><Images className="w-10 h-10 mb-2" /></div>}
                </div>
                <div className="flex justify-center mt-3">
                  <Button variant="outline" size="sm" onClick={() => coverRef.current?.click()} disabled={photoUploading} className="shadow-sm">
                    <Upload className="w-3.5 h-3.5 mr-2" /> Change Cover
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">Recommended size: 1600x400 px</p>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </div>

              <div className="pt-6">
                <Button onClick={handleSaveLibraryInfo} disabled={updateConfig.isPending} className="shadow-sm btn-press bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-48 h-10">
                  <Save className="w-4 h-4 mr-2" />
                  {updateConfig.isPending ? "Saving..." : "Save Library Info"}
                </Button>
              </div>
            </div>

            {/* Right Column - System Settings & Uploads */}
            <div className="space-y-8">
              
              {/* Logo Card */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Library Details</Label>
                <Card className="shadow-sm border-border">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 mb-6 overflow-hidden">
                      {logoPreview ? <img src={logoPreview} alt="Logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        : <Building2 className="w-8 h-8 text-indigo-500" />}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()} disabled={photoUploading} className="w-full shadow-sm mb-2">
                      <Upload className="w-3.5 h-3.5 mr-2" /> Change Logo
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Recommended size: 500x500 px</p>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </CardContent>
                </Card>
              </div>

              {/* System Settings */}
              <div className="space-y-4 pt-2">
                <Label className="text-sm font-semibold text-foreground border-b border-border pb-2 block">System Settings</Label>
                
                <ToggleSetting label="Email Notifications" description="Send email notifications for important events" defaultChecked={true} />
                <ToggleSetting label="SMS Notifications" description="Send SMS notifications to students" defaultChecked={true} />
                <ToggleSetting label="Auto Fee Reminders" description="Automatically send fee reminder" defaultChecked={true} />
                <ToggleSetting label="Public Website" description="Make library website public" 
                  checked={(config as any)?.websiteEnabled ?? true} 
                  onCheckedChange={(checked: boolean) => handleUpdate({ websiteEnabled: checked })} />
                <ToggleSetting label="Maintenance Mode" description="Temporarily disable public access" defaultChecked={false} />
              </div>

            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
           {/* Gallery */}
           <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base font-bold">Gallery Slideshow</CardTitle>
              <CardDescription>Upload photos for your public library page's auto-sliding gallery.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-end mb-4">
                <Button variant="outline" size="sm" onClick={() => galleryRef.current?.click()} disabled={photoUploading} className="shadow-sm">
                  <ImagePlus className="w-3.5 h-3.5 mr-2" /> Add Photos
                </Button>
              </div>
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
              <input ref={galleryReplaceRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryReplace} />
              {galleryPreviews.length === 0 ? (
                <div className="w-full h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:border-primary transition-colors bg-muted/10"
                  onClick={() => galleryRef.current?.click()}>
                  <Images className="w-8 h-8" /><span className="text-sm">Click to add gallery photos</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryPreviews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm">
                      <img src={src} alt={`Gallery ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      <button onClick={() => removeGalleryImage(i)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" title="Remove"><X className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setReplaceIndex(i); galleryReplaceRef.current?.click(); }} className="absolute top-2 left-2 px-2.5 h-6 rounded-full bg-black/70 text-white text-[10px] font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600" title="Replace">Replace</button>
                    </div>
                  ))}
                  <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/10"
                    onClick={() => galleryRef.current?.click()}>
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base font-bold">Appearance & Localization</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                <div><Label className="text-base font-bold text-foreground">Theme</Label><p className="text-sm text-muted-foreground">Toggle between Light and Dark mode globally.</p></div>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                <div><Label className="text-base font-bold text-foreground">Language</Label><p className="text-sm text-muted-foreground">Set your preferred default language.</p></div>
                <LanguageToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public" className="mt-0 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base font-bold">Public Website</CardTitle>
              <CardDescription>Manage your library's public-facing landing page configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Website URL / Slug</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center flex-1 rounded-lg border border-border bg-muted/30 px-3 h-11">
                    <span className="text-muted-foreground text-sm select-none truncate">{baseUrl}/library/</span>
                    <Input className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 font-medium"
                      defaultValue={(config as any)?.websiteSlug || ""} placeholder="your-library-slug"
                      onChange={(e) => setSlugInput(e.target.value)} />
                  </div>
                  <Button onClick={() => handleUpdate({ websiteSlug: slugInput || (config as any)?.websiteSlug })} className="shadow-sm btn-press h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white">Save Slug</Button>
                </div>
              </div>

              {/* Theme Picker */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <Label className="text-base font-semibold text-foreground">Website Theme</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose how your public library page looks to visitors. Current: <span className="font-semibold text-foreground">{getTheme((config as any)?.websiteTheme).name}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {WEBSITE_THEMES.map((wt) => {
                    const isActive = ((config as any)?.websiteTheme ?? "black-gold") === wt.id;
                    const isHovered = hoveredTheme === wt.id;
                    return (
                      <button key={wt.id} onClick={() => handleUpdate({ websiteTheme: wt.id }, `✨ Theme changed to "${wt.name}"!`)}
                        onMouseEnter={() => setHoveredTheme(wt.id)} onMouseLeave={() => setHoveredTheme(null)} title={wt.description}
                        style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left", outline: "none" }}>
                        <div style={{
                          position: "relative", width: "100%", height: "4rem", borderRadius: "0.75rem", overflow: "hidden",
                          border: isActive ? `2.5px solid ${wt.vars.accent}` : isHovered ? `2px solid ${wt.vars.accent}99` : `2px solid hsl(var(--border))`,
                          boxShadow: isActive ? `0 0 0 3px ${wt.vars.accent}33` : isHovered ? `0 4px 12px ${wt.vars.accent}30` : "0 1px 4px rgba(0,0,0,0.05)",
                          transform: isHovered ? "translateY(-2px)" : "none", transition: "all 0.2s ease", display: "flex",
                        }}>
                          <div style={{ flex: 1, background: wt.vars.bg }} />
                          <div style={{ flex: 1, background: wt.vars.accent }} />
                          {isActive && (
                            <div style={{
                              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                              width: "1.6rem", height: "1.6rem", borderRadius: "50%", background: "rgba(255,255,255,0.95)",
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 900,
                              color: wt.vars.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}>✓</div>
                          )}
                        </div>
                        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: isActive ? 700 : 500, color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))", lineHeight: 1.3, paddingLeft: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {wt.emoji} {wt.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                <Button variant="secondary" className="flex-1 sm:flex-none btn-press h-10 px-6 font-medium bg-muted hover:bg-muted/80" onClick={() => copyLink((config as any)?.websiteSlug || "")} disabled={!(config as any)?.websiteSlug}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Link
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none btn-press h-10 px-6 font-medium shadow-sm" onClick={() => openWebsite((config as any)?.websiteSlug || "")} disabled={!(config as any)?.websiteSlug || !(config as any)?.websiteEnabled}>
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Website
                </Button>
                <Button variant="ghost" className="btn-press h-10 px-6 font-medium text-muted-foreground hover:text-foreground" onClick={() => {
                  const random = Math.random().toString(36).substring(2, 8);
                  const generated = `${(config as any)?.libraryName?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${random}`;
                  setSlugInput(generated); handleUpdate({ websiteSlug: generated });
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Regenerate Slug
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ToggleSetting({ label, description, defaultChecked, checked, onCheckedChange }: any) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="space-y-0.5 max-w-[200px]">
        <Label className="text-[13px] font-semibold text-foreground leading-tight">{label}</Label>
        <p className="text-[11px] text-muted-foreground leading-tight">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-indigo-600 scale-90 origin-right" />
    </div>
  );
}
