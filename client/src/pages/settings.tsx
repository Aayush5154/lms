import { useState, useEffect, useRef } from "react";
import { useGetLibraryConfig, useUpdateLibraryConfig } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, ExternalLink, RefreshCw, Palette, Building2, Save, Monitor, ImagePlus, MapPin, Upload, X, Images } from "lucide-react";
import { uploadFile } from "@/services/upload";
import { ThemeToggle } from "@/layouts/ThemeToggle";
import { LanguageToggle } from "@/layouts/LanguageToggle";
import { WEBSITE_THEMES, getTheme } from "@/utils/websiteThemes";

export default function Settings() {
  const { data: config, isLoading, refetch } = useGetLibraryConfig();
  const updateConfig = useUpdateLibraryConfig();
  const [slugInput, setSlugInput] = useState("");
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // Library info form state
  const [form, setForm] = useState({
    libraryName: "",
    totalSeats: "",
    whatsappNumber: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    ownerName: "",
    openingTime: "",
    closingTime: "",
    description: "",
    googleMapsLink: "",
    facilities: "",
  });

  // Photo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const galleryReplaceRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  // Populate form when config loads
  useEffect(() => {
    if (config) {
      setForm({
        libraryName: (config as any).libraryName || "",
        totalSeats: String((config as any).totalSeats || ""),
        whatsappNumber: (config as any).whatsappNumber || "",
        phone: (config as any).phone || "",
        address: (config as any).address || "",
        city: (config as any).city || "",
        state: (config as any).state || "",
        ownerName: (config as any).ownerName || "",
        openingTime: (config as any).openingTime || "",
        closingTime: (config as any).closingTime || "",
        description: (config as any).description || "",
        googleMapsLink: (config as any).googleMapsLink || "",
        facilities: ((config as any).facilities || []).join(", "),
      });
      // Seed existing images
      if ((config as any).logoUrl) setLogoPreview((config as any).logoUrl);
      if ((config as any).coverImageUrl) setCoverPreview((config as any).coverImageUrl);
      if ((config as any).galleryImages?.length) setGalleryPreviews((config as any).galleryImages);
    }
  }, [config]);

  const handleUpdate = (updates: any, successMessage = "Settings updated") => {
    updateConfig.mutate(
      { data: updates },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (err: any) => toast.error(err.response?.data?.error || "Update failed"),
      }
    );
  };

  const handleSaveLibraryInfo = () => {
    if (!form.libraryName.trim()) {
      toast.error("Library name is required");
      return;
    }
    const seats = Number(form.totalSeats);
    if (isNaN(seats) || seats < 1) {
      toast.error("Please enter a valid number of seats");
      return;
    }
    handleUpdate({
      libraryName: form.libraryName.trim(),
      totalSeats: seats,
      whatsappNumber: form.whatsappNumber.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      ownerName: form.ownerName.trim() || undefined,
      openingTime: form.openingTime.trim() || undefined,
      closingTime: form.closingTime.trim() || undefined,
      description: form.description.trim() || undefined,
      googleMapsLink: form.googleMapsLink.trim() || undefined,
      facilities: form.facilities.split(",").map(f => f.trim()).filter(Boolean),
    });
  };

  // ---- Photo helpers ----

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoUploading(true);
      await uploadFile("logo", file);
      toast.success("Logo Uploaded Successfully");
      refetch();
    } catch (error) {
      toast.error("Logo upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoUploading(true);
      await uploadFile("cover", file);
      toast.success("Cover Image Uploaded Successfully");
      refetch();
    } catch (error) {
      toast.error("Cover upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotoUploading(true);
    try {
      for (const file of files) {
        await uploadFile("gallery", file, "files");
      }
      toast.success(`${files.length} photo(s) added to gallery!`);
      refetch();
    } catch {
      toast.error("Failed to read image files");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleGalleryReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;
    setPhotoUploading(true);
    try {
      await uploadFile(`gallery?replaceIndex=${replaceIndex}`, file, "files");
      toast.success("Gallery photo replaced!");
      refetch();
    } catch {
      toast.error("Failed to replace photo");
    } finally {
      setPhotoUploading(false);
      setReplaceIndex(null);
      if (galleryReplaceRef.current) galleryReplaceRef.current.value = '';
    }
  };

  const removeGalleryImage = (idx: number) => {
    const updated = galleryPreviews.filter((_, i) => i !== idx);
    setGalleryPreviews(updated);
    updateConfig.mutate(
      { data: { galleryImages: updated } },
      {
        onSuccess: () => toast.success("Gallery image removed"),
        onError: (err: any) => toast.error(err.response?.data?.error || "Remove failed"),
      }
    );
  };

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const copyLink = async (slug: string) => {
    const url = `${baseUrl}/library/${slug}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
        } catch {
          toast.error("Failed to copy link");
          return;
        } finally {
          textArea.remove();
        }
      }
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const openWebsite = (slug: string) => {
    window.open(`${baseUrl}/library/${slug}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const field = (
    key: keyof typeof form,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div className="space-y-1">
      <Label htmlFor={key} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={key}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your library information</p>
      </div>

      {/* Library Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Library Information
          </CardTitle>
          <CardDescription>
            Update your library details shown on the public website and used for WhatsApp enquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("libraryName", "Library Name *", "text", "e.g. My Study Library")}
            {field("totalSeats", "Total Seats *", "number", "e.g. 50")}
            {field("ownerName", "Owner Name", "text", "e.g. Rahul Sharma")}
            {field("phone", "Phone Number", "tel", "e.g. 9876543210")}
            {field("whatsappNumber", "WhatsApp Number", "tel", "e.g. +919876543210")}
            <div className="space-y-1 text-xs text-muted-foreground col-span-full -mt-2">
              ℹ️ The WhatsApp number is used for the <strong>Join Today</strong> and <strong>Enquire Now</strong> buttons on your public website.
            </div>
            {field("address", "Address", "text", "e.g. 123 Main Street")}
            {field("city", "City", "text", "e.g. Jaipur")}
            {field("state", "State", "text", "e.g. Rajasthan")}
            {field("openingTime", "Opening Time", "text", "e.g. 08:00 AM")}
            {field("closingTime", "Closing Time", "text", "e.g. 10:00 PM")}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Describe your library for public visitors..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="facilities" className="text-sm font-medium">Facilities (Comma Separated)</Label>
            <textarea
              id="facilities"
              rows={2}
              placeholder="AC, High Speed WiFi, RO Water, Discussion Room"
              value={form.facilities}
              onChange={(e) => setForm((f) => ({ ...f, facilities: e.target.value }))}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These facilities will be displayed on your public website. Leave empty to show the default facilities.
            </p>
          </div>

          {/* Google Maps Link */}
          <div className="space-y-1">
            <Label htmlFor="googleMapsLink" className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Google Maps Link
              <span className="text-xs text-muted-foreground font-normal ml-1">(optional)</span>
            </Label>
            <Input
              id="googleMapsLink"
              type="url"
              placeholder="https://maps.google.com/..."
              value={form.googleMapsLink}
              onChange={(e) => setForm((f) => ({ ...f, googleMapsLink: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Paste your Google Maps share link here — it will display as a clickable map on your public website.
            </p>
          </div>

          <Button onClick={handleSaveLibraryInfo} disabled={updateConfig.isPending} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {updateConfig.isPending ? "Saving..." : "Save Library Info"}
          </Button>
        </CardContent>
      </Card>

      {/* Website Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="w-5 h-5" /> Website Photos
          </CardTitle>
          <CardDescription>
            Upload photos shown on your public library page — logo, hero cover, and gallery slideshow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Logo */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Library Logo</Label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => logoRef.current?.click()}
                title="Click to upload logo"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoRef.current?.click()}
                  disabled={photoUploading}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {logoPreview ? "Replace Logo" : "Upload Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">Recommended: square, at least 200×200 px</p>
              </div>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>

          {/* Cover / Hero Image */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-semibold">Cover / Hero Image</Label>
            <p className="text-xs text-muted-foreground -mt-1">Shown as the full-width banner at the top of your public page.</p>
            <div
              className="relative w-full h-40 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => coverRef.current?.click()}
              title="Click to upload cover image"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm">Click to upload cover photo</span>
                </div>
              )}
              {coverPreview && (
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">
                    <Upload className="w-3.5 h-3.5 inline mr-1" />Replace
                  </span>
                </div>
              )}
            </div>
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </div>

          {/* Gallery */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Gallery Slideshow</Label>
                <p className="text-xs text-muted-foreground mt-0.5">These photos appear in the auto-sliding gallery on your public page.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => galleryRef.current?.click()}
                disabled={photoUploading}
              >
                <ImagePlus className="w-3.5 h-3.5 mr-1.5" /> Add Photos
              </Button>
            </div>
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
            <input ref={galleryReplaceRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryReplace} />

            {galleryPreviews.length === 0 ? (
              <div
                className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:border-primary transition-colors bg-muted/20"
                onClick={() => galleryRef.current?.click()}
              >
                <Images className="w-8 h-8" />
                <span className="text-sm">Click to add gallery photos</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={src} alt={`Gallery ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { setReplaceIndex(i); galleryReplaceRef.current?.click(); }}
                      className="absolute top-1 left-1 px-2 h-5 rounded-full bg-black/70 text-white text-[10px] font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                      title="Replace"
                    >
                      Replace
                    </button>
                  </div>
                ))}
                {/* Add more button */}
                <div
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
                  onClick={() => galleryRef.current?.click()}
                >
                  <ImagePlus className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" /> Appearance & Localization
          </CardTitle>
          <CardDescription>Customize the look and feel of your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">Toggle between Light and Dark mode globally.</p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label className="text-base">Language</Label>
              <p className="text-sm text-muted-foreground">Set your preferred default language.</p>
            </div>
            <LanguageToggle />
          </div>
        </CardContent>
      </Card>

      {/* Public Website */}
      <Card>
        <CardHeader>
          <CardTitle>Public Website</CardTitle>
          <CardDescription>Manage your library's public-facing landing page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Public Website</Label>
              <p className="text-sm text-muted-foreground">
                When active, your library profile is visible to the public.
              </p>
            </div>
            <Switch
              checked={(config as any)?.websiteEnabled ?? true}
              onCheckedChange={(checked) => handleUpdate({ websiteEnabled: checked })}
            />
          </div>

          <div className="space-y-3">
            <Label>Website URL / Slug</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center flex-1 rounded-md border bg-muted/20 px-3">
                <span className="text-muted-foreground text-sm select-none truncate">
                  {baseUrl}/library/
                </span>
                <Input
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                  defaultValue={(config as any)?.websiteSlug || ""}
                  placeholder="your-library-slug"
                  onChange={(e) => setSlugInput(e.target.value)}
                />
              </div>
              <Button onClick={() => handleUpdate({ websiteSlug: slugInput || (config as any)?.websiteSlug })}>
                Save Slug
              </Button>
            </div>
          </div>

          {/* Theme Picker */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              <div>
                <Label className="text-base font-semibold">Website Theme</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose how your public library page looks to visitors. Current: <span className="font-semibold text-foreground">{getTheme((config as any)?.websiteTheme).name}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {WEBSITE_THEMES.map((wt) => {
                const isActive = ((config as any)?.websiteTheme ?? "black-gold") === wt.id;
                const isHovered = hoveredTheme === wt.id;
                return (
                  <button
                    key={wt.id}
                    onClick={() =>
                      handleUpdate(
                        { websiteTheme: wt.id },
                        `✨ Theme changed to "${wt.name}"!`
                      )
                    }
                    onMouseEnter={() => setHoveredTheme(wt.id)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    title={wt.description}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      outline: "none",
                    }}
                  >
                    {/* Color swatch: left half = bg, right half = accent */}
                    <div style={{
                      position: "relative",
                      width: "100%",
                      height: "3.5rem",
                      borderRadius: "0.625rem",
                      overflow: "hidden",
                      border: isActive
                        ? `2.5px solid ${wt.vars.accent}`
                        : isHovered
                        ? `2px solid ${wt.vars.accent}99`
                        : `2px solid transparent`,
                      boxShadow: isActive
                        ? `0 0 0 3px ${wt.vars.accent}33`
                        : isHovered
                        ? `0 4px 12px ${wt.vars.accent}30`
                        : "0 1px 4px rgba(0,0,0,0.18)",
                      transform: isHovered ? "translateY(-1px)" : "none",
                      transition: "all 0.15s ease",
                      display: "flex",
                    }}>
                      {/* Left: background color */}
                      <div style={{ flex: 1, background: wt.vars.bg }} />
                      {/* Right: accent color */}
                      <div style={{ flex: 1, background: wt.vars.accent }} />
                      {/* Active checkmark */}
                      {isActive && (
                        <div style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "1.4rem",
                          height: "1.4rem",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.95)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 900,
                          color: wt.vars.bg,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                    {/* Name below swatch */}
                    <div style={{
                      marginTop: "0.4rem",
                      fontSize: "0.7rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                      lineHeight: 1.3,
                      paddingLeft: "0.1rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {wt.emoji} {wt.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => copyLink((config as any)?.websiteSlug || "")}
              disabled={!(config as any)?.websiteSlug}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => openWebsite((config as any)?.websiteSlug || "")}
              disabled={!(config as any)?.websiteSlug || !(config as any)?.websiteEnabled}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open Website
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const random = Math.random().toString(36).substring(2, 8);
                const generated = `${(config as any)?.libraryName?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${random}`;
                setSlugInput(generated);
                handleUpdate({ websiteSlug: generated });
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate Slug
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
