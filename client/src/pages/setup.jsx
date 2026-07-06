import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateLibraryConfig, useGetLibraryConfig } from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, MapPin, Building, Image as ImageIcon, Settings, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
function SetupWizard() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { token, admin } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { data: config } = useGetLibraryConfig({ query: { enabled: !!token } });
  const { mutateAsync: updateConfig } = useUpdateLibraryConfig();
  const [formData, setFormData] = useState({
    libraryName: admin?.libraryName || "",
    ownerName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    totalSeats: 50,
    openingTime: "08:00",
    closingTime: "22:00",
    monthlyFeeDefault: 1e3,
    libraryType: "study-library",
    description: "",
    googleMapsLink: "",
    whatsappNumber: "",
    facilities: "",
    // comma separated
    logoFile: null,
    galleryFiles: [],
    theme: "black-gold",
    language: "en"
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e, field) => {
    const files = e.target.files;
    if (!files) return;
    if (field === "logoFile") {
      setFormData((prev) => ({ ...prev, logoFile: files[0] }));
    } else {
      const newFiles = Array.from(files);
      setFormData((prev) => ({ ...prev, galleryFiles: [...prev.galleryFiles, ...newFiles].slice(0, 6) }));
    }
  };
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateConfig({
        data: {
          libraryName: formData.libraryName,
          ownerName: formData.ownerName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          totalSeats: formData.totalSeats,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          monthlyFeeDefault: formData.monthlyFeeDefault,
          libraryType: formData.libraryType,
          description: formData.description,
          googleMapsLink: formData.googleMapsLink,
          whatsappNumber: formData.whatsappNumber || formData.phone,
          facilities: formData.facilities.split(",").map((f) => f.trim()).filter(Boolean),
          theme: formData.theme,
          language: formData.language,
          setupCompleted: true,
          upiId: config?.upiId || "",
          upiQrUrl: config?.upiQrUrl || ""
        }
      });
      const { uploadFile } = await import("@/services/upload");
      if (formData.logoFile) {
        await uploadFile("logo", formData.logoFile);
      }
      if (formData.galleryFiles.length > 0) {
        for (const file of formData.galleryFiles) {
          await uploadFile("gallery", file, "files");
        }
      }
      localStorage.setItem("lms_lang", formData.language);
      window.location.href = "/";
    } catch {
      alert("Failed to save configuration.");
    } finally {
      setLoading(false);
    }
  };
  const steps = [
    { title: "Welcome", icon: Building },
    { title: "Configuration", icon: Settings },
    { title: "Public Profile", icon: MapPin },
    { title: "Media", icon: ImageIcon },
    { title: "Done", icon: CheckCircle2 }
  ];
  return <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex justify-between">
          {steps.map((s, i) => {
    const active = step >= i + 1;
    return <div key={i} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</span>
                {i < steps.length - 1 && <div className={`absolute top-5 left-[50%] right-[-50%] h-[2px] -z-10 ${step > i + 1 ? "bg-primary" : "bg-border"}`} />}
              </div>;
  })}
        </div>

        <Card className="w-full border shadow-lg bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">{steps[step - 1]?.title}</CardTitle>
            <CardDescription>Step {step} of 5</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
    key={step}
    initial={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -20, opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="space-y-4"
  >
                {step === 1 && <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Library Name</Label>
                      <Input name="libraryName" value={formData.libraryName} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label>Owner Name</Label>
                      <Input name="ownerName" value={formData.ownerName} onChange={handleChange} />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Textarea name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input name="state" value={formData.state} onChange={handleChange} />
                    </div>
                  </div>}

                {step === 2 && <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Seats</Label>
                      <Input type="number" name="totalSeats" value={formData.totalSeats} onChange={handleChange} />
                    </div>
                    <div>
                      <Label>Default Monthly Fee</Label>
                      <Input type="number" name="monthlyFeeDefault" value={formData.monthlyFeeDefault} onChange={handleChange} />
                    </div>
                    <div>
                      <Label>Opening Time</Label>
                      <Input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} />
                    </div>
                    <div>
                      <Label>Closing Time</Label>
                      <Input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} />
                    </div>
                    <div className="col-span-2">
                      <Label>Library Type</Label>
                      <Select value={formData.libraryType} onValueChange={(val) => handleSelectChange("libraryType", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="study-library">Study Library</SelectItem>
                          <SelectItem value="reading-room">Reading Room</SelectItem>
                          <SelectItem value="coaching">Coaching Library</SelectItem>
                          <SelectItem value="mixed">Mixed Facility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Default Language</Label>
                      <Select value={formData.language} onValueChange={(val) => handleSelectChange("language", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>}

                {step === 3 && <div className="space-y-4">
                    <div>
                      <Label>Public Description</Label>
                      <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Welcome to our premium study center..." className="h-24" />
                    </div>
                    <div>
                      <Label>Facilities (comma separated)</Label>
                      <Input name="facilities" value={formData.facilities} onChange={handleChange} placeholder="AC, High Speed WiFi, RO Water, Discussion Room" />
                    </div>
                    <div>
                      <Label>Google Maps Link</Label>
                      <Input name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
                    </div>
                    <div>
                      <Label>WhatsApp Number for Enquiries</Label>
                      <Input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="e.g. +919876543210" />
                    </div>
                  </div>}

                {step === 4 && <div className="space-y-6">
                    <div>
                      <Label className="block mb-2">Library Logo (Required for Public Page)</Label>
                      <div className="flex items-center gap-4">
                        {formData.logoFile && <ObjectUrlImage file={formData.logoFile} alt="Logo" className="w-20 h-20 rounded-md object-cover border" />}
                        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logoFile")} className="w-full" />
                      </div>
                    </div>
                    <div>
                      <Label className="block mb-2">Gallery Images (Max 6)</Label>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {formData.galleryFiles.map((file, i) => <div key={i} className="relative aspect-video rounded-md overflow-hidden border">
                            <ObjectUrlImage file={file} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                            <Button
    variant="destructive"
    size="icon"
    className="absolute top-1 right-1 h-6 w-6"
    onClick={() => setFormData((prev) => ({ ...prev, galleryFiles: prev.galleryFiles.filter((_, idx) => idx !== i) }))}
  >
                              &times;
                            </Button>
                          </div>)}
                      </div>
                      {formData.galleryFiles.length < 6 && <Input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, "galleryFiles")} />}
                    </div>
                  </div>}

                {step === 5 && <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold">You're all set!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your premium library management SaaS is ready. Your public website has been generated and your configuration is saved.
                    </p>
                    <div className="p-4 bg-muted rounded-lg text-left inline-block w-full max-w-sm mt-4">
                      <h4 className="font-semibold mb-2">Selected Theme:</h4>
                      <Select value={formData.theme} onValueChange={(val) => handleSelectChange("theme", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black-gold">Black + Yellow Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={prevStep} disabled={step === 1 || loading}>
              Previous
            </Button>
            {step < 5 ? <Button onClick={nextStep} className="px-8">
                Next
              </Button> : <Button onClick={handleFinish} disabled={loading} className="px-8">
                {loading ? "Saving..." : "Finish & Go To Dashboard"}
              </Button>}
          </CardFooter>
        </Card>
      </div>
    </div>;
}
function ObjectUrlImage({ file, alt, className }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (!src) return null;
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />;
}
export {
  SetupWizard as default
};
