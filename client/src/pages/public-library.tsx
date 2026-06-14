import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { useGetPublicLibrary } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, Wind, Zap, Shield, Monitor,
  MapPin, Phone, Mail, Instagram, Facebook, Twitter,
  CheckCircle2, Star, ChevronRight, X, Menu, Users, Coffee, Check,
  Droplet, BatteryCharging, Video, Armchair, MessageSquare, Printer, Newspaper, Clock, ChevronLeft, ArrowRight, BookOpen
} from "lucide-react";
import { getTheme } from "@/utils/websiteThemes";

export default function PublicLibrary() {
  const [, params] = useRoute("/library/:id");
  const id = params?.id;

  const { data: library, isLoading, error } = useGetPublicLibrary(id || "", {
    query: { enabled: !!id } as any,
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "pub-lib-global";
    el.textContent = `
      html { scroll-behavior: smooth; }
      body { margin: 0; font-family: 'Inter', sans-serif; overflow-x: hidden; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(el);
    return () => { document.getElementById("pub-lib-global")?.remove(); };
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-bold text-xl">Loading Space...</div>;
  if (error || !library) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-bold text-xl">Space not found.</div>;

  const theme = getTheme((library as any).websiteTheme);
  const t = theme.vars;

  const cssVars = {
    '--bg': t.bg,
    '--bg-secondary': t.bgSecondary,
    '--card': t.card,
    '--card-border': t.cardBorder,
    '--accent': t.accent,
    '--accent-text': t.accentText,
    '--text': t.text,
    '--text-muted': t.textMuted,
    '--footer-bg': t.footerBg,
    '--footer-text': t.footerText,
    '--gradient-from': t.gradientFrom,
    '--gradient-to': t.gradientTo,
  } as React.CSSProperties;

  const handleWhatsApp = () => {
    if (library.whatsappNumber) {
      window.open(`https://wa.me/${library.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi, I would like to join ${library.libraryName}`, "_blank");
    }
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const placeholderImages = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80",
  ];
  const galleryImgs = library.galleryImages?.length ? library.galleryImages : placeholderImages;
  const heroImg = library.coverImageUrl || galleryImgs[0];

  const getFacilityIcon = (name: string, size = 24) => {
    const n = name.toLowerCase();
    if (n.includes("wifi")) return <Wifi size={size} />;
    if (n.includes("ac") || n.includes("air")) return <Wind size={size} />;
    if (n.includes("water") || n.includes("ro") || n.includes("drink")) return <Droplet size={size} />;
    if (n.includes("coffee") || n.includes("tea") || n.includes("cafe")) return <Coffee size={size} />;
    if (n.includes("print") || n.includes("scan")) return <Printer size={size} />;
    if (n.includes("computer") || n.includes("pc")) return <Monitor size={size} />;
    if (n.includes("cctv") || n.includes("camera") || n.includes("surveillance")) return <Video size={size} />;
    if (n.includes("security") || n.includes("locker")) return <Shield size={size} />;
    if (n.includes("charging") || n.includes("port") || n.includes("plug")) return <BatteryCharging size={size} />;
    if (n.includes("power") || n.includes("backup") || n.includes("electricity")) return <Zap size={size} />;
    if (n.includes("discussion") || n.includes("meeting")) return <MessageSquare size={size} />;
    if (n.includes("chair") || n.includes("seat") || n.includes("ergonomic")) return <Armchair size={size} />;
    if (n.includes("news") || n.includes("paper") || n.includes("magazine")) return <Newspaper size={size} />;
    return <CheckCircle2 size={size} />;
  };

  const getFacilityDesc = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("wifi")) return "High-Speed Internet";
    if (n.includes("ac") || n.includes("air")) return "Comfort 24/7";
    if (n.includes("water") || n.includes("ro")) return "Purified & Safe";
    if (n.includes("power") || n.includes("charging") || n.includes("backup")) return "Uninterrupted Access";
    if (n.includes("security") || n.includes("cctv")) return "24/7 Surveillance";
    if (n.includes("chair") || n.includes("seat")) return "Ergonomic Setup";
    if (n.includes("locker")) return "Safe Storage";
    if (n.includes("discussion") || n.includes("meeting")) return "Collaborative Spaces";
    return "Premium Quality";
  };

  const backendFacilities = library.facilities && library.facilities.length > 0
    ? library.facilities
    : [
      "High-Speed WiFi", "Air Conditioned", "Power Backup", "RO Water",
      "Lockers", "CCTV Security", "Ergonomic Chairs", "Charging Ports",
      "Discussion Area", "Printing", "Computer Access", "Newspaper Corner"
    ];

  const topFeatures = backendFacilities.slice(0, 6).map((fac: string) => ({
    icon: getFacilityIcon(fac, 24),
    title: fac,
    desc: getFacilityDesc(fac)
  }));

  const gridFacilities = backendFacilities.map((fac: string) => ({
    icon: getFacilityIcon(fac, 28),
    title: fac
  }));

  const plans = library.membershipPlans && library.membershipPlans.length > 0 ? library.membershipPlans : [
    { name: "Basic", price: `₹${library.monthlyFeeDefault || 1000}`, desc: "Perfect for part-time learners and flexible schedules.", features: ["Flexible Seating", "High-Speed WiFi", "RO Water", "Standard Support"] },
    { name: "Premium", price: `₹${(library.monthlyFeeDefault || 1000) * 2}`, desc: "For dedicated students & pros who need the absolute best.", features: ["Reserved Cabin Seat", "24/7 Access", "Unlimited Coffee", "Discussion Room", "Locker Included"], recommended: true },
    { name: "Standard", price: `₹${Math.round((library.monthlyFeeDefault || 1000) * 1.5)}`, desc: "The balanced everyday plan for consistent learners.", features: ["Dedicated Desk", "High-Speed WiFi", "RO Water", "Power Backup"] }
  ];

  return (
    <div style={{ ...cssVars, backgroundColor: "var(--bg)", color: "var(--text)" }} className="min-h-screen relative font-sans">

      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[var(--card)] shadow-md py-3' : 'bg-[var(--card)] py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("home")}>
            {library.logoUrl ? (
              <img src={library.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <BookOpen size={32} style={{ color: "var(--accent)" }} />
                <span className="font-extrabold text-xl tracking-tight hidden sm:block uppercase">{library.libraryName}</span>
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Facilities", "Gallery", "Location", "Contact"].map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-[15px] font-semibold hover:text-[var(--accent)] transition-colors">
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={handleWhatsApp} className="hidden sm:flex px-6 py-2.5 rounded-md font-bold transition-all shadow-sm" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
              Join Now
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} className="fixed inset-0 z-[60] bg-[var(--card)] flex flex-col pt-24 px-6">
            <button className="absolute top-6 right-6 p-2" onClick={() => setMobileMenuOpen(false)}>
              <X size={32} />
            </button>
            <div className="flex flex-col gap-6 text-xl font-bold">
              {["Home", "Facilities", "Gallery", "Location", "Contact"].map(item => (
                <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-left py-2 border-b border-[var(--card-border)] hover:text-[var(--accent)]">
                  {item}
                </button>
              ))}
              <button onClick={handleWhatsApp} className="mt-8 px-6 py-4 rounded-md text-center" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
                Join Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section id="home" className="relative pt-28 pb-32 lg:pt-36 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto min-h-[90vh] flex items-center">
        {/* Background Image with Fade */}
        <div className="absolute top-0 right-0 w-full lg:w-[65%] h-full z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/80 to-transparent z-10 lg:block hidden"></div>
          <div className="absolute inset-0 bg-[var(--bg)]/70 z-10 lg:hidden block"></div>
          <img src={heroImg} alt="Library Interior" className="w-full h-full object-cover object-center" />
        </div>

        <div className="relative z-20 w-full flex flex-col lg:flex-row items-center">
          <div className="flex-1 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6">
              <Star size={16} fill="currentColor" style={{ color: "var(--accent)" }} />
              <span className="text-sm font-bold tracking-widest uppercase text-[var(--text-muted)]">Premium Study Environment</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-[var(--text)]">
              A Premium Space For <br />
              Focused Learning & <br />
              <span style={{ color: "var(--accent)" }}>Real Results.</span>
            </h1>

            <p className="text-lg text-[var(--text-muted)] mb-10 max-w-lg leading-relaxed font-medium">
              {library.description || "A calm, comfortable and distraction-free environment designed for serious learners and achievers."}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <button onClick={() => scrollTo("facilities")} className="w-full sm:w-auto px-8 py-3.5 rounded-md font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
                Explore Facilities <ChevronRight size={20} />
              </button>
              <button onClick={handleWhatsApp} className="w-full sm:w-auto px-8 py-3.5 rounded-md font-bold text-lg flex items-center justify-center gap-2 border-2 hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all bg-[var(--card)]" style={{ borderColor: "var(--card-border)", color: "var(--text)" }}>
                <MessageSquare size={20} /> Join on WhatsApp
              </button>
            </div>

            {/* Active Learners */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" className="w-12 h-12 rounded-full border-2 border-[var(--bg)] object-cover" />
                ))}
              </div>
              <div>
                <div className="font-bold text-[var(--text)]">500+ Active Learners</div>
                <div className="text-sm text-[var(--text-muted)]">Join a community of achievers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Features Bar */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-6xl px-4 z-30 hidden lg:block">
          <div className="bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--card-border)] p-6 flex justify-between items-center divide-x divide-[var(--card-border)]">
            {topFeatures.map((feat, i) => (
              <div key={i} className="flex flex-col items-center justify-center flex-1 px-2 text-center gap-2">
                <div style={{ color: "var(--accent)" }}>{feat.icon}</div>
                <div>
                  <div className="font-bold text-sm text-[var(--text)]">{feat.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{feat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACILITIES GRID */}
      <section id="facilities" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[var(--bg)]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="lg:w-1/3">
            <div className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>Our Facilities</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)] leading-tight mb-6">Everything You Need To Stay Productive</h2>
          </div>
          <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gridFacilities.map((fac, i) => (
              <div key={i} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-[var(--accent)] transition-colors shadow-sm cursor-default">
                <div style={{ color: "var(--accent)" }}>{fac.icon}</div>
                <span className="font-semibold text-sm text-[var(--text)]">{fac.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - DARK STRIP */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--footer-bg)" }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="lg:w-1/3 text-left">
            <div className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: "var(--accent)" }}>Why Choose Us?</div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">Built For Focus.<br />Designed For Success.</h2>
          </div>
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users size={32} />, num: "500+", label: "Active Students" },
              { icon: <Clock size={32} />, num: "24/7", label: "Access" },
              { icon: <Wifi size={32} />, num: "100 Mbps", label: "High-Speed WiFi" },
              { icon: <Star size={32} />, num: "95%", label: "Student Satisfaction" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left gap-3">
                <div style={{ color: "var(--accent)" }}>{stat.icon}</div>
                <div className="text-3xl font-extrabold text-white">{stat.num}</div>
                <div className="text-sm font-medium text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <div className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: "var(--accent)" }}>Gallery</div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text)]">A Glimpse Of Our Space</h2>
          </div>
          <button className="px-6 py-2.5 rounded-md font-bold text-sm border-2 transition-all hover:bg-[var(--accent)] hover:text-[var(--accent-text)] hover:border-[var(--accent)]" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
            View Full Gallery
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryImgs.slice(0, 4).map((img, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group relative" onClick={() => setLightboxImg(img)}>
              <img src={img} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 p-3 rounded-full text-black"><Star size={20} /></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEMBERSHIP PLANS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: "var(--accent)" }}>Membership Plans</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {plans.map((plan: any, i: number) => {
              const isPopular = plan.recommended || plan.name.toLowerCase() === 'premium';
              return (
                <div key={i} className={`bg-[var(--card)] rounded-2xl p-8 relative flex flex-col h-full ${isPopular ? 'border-2 shadow-2xl md:-translate-y-4' : 'border shadow-md'}`} style={{ borderColor: isPopular ? "var(--accent)" : "var(--card-border)" }}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-md" style={{ backgroundColor: "var(--accent)" }}>
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-1 text-[var(--text)]">{plan.name}</h3>
                  <div className="text-sm text-[var(--text-muted)] mb-6 h-10">{plan.desc || "Standard access to the library facilities."}</div>
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-[var(--text)]">{plan.price}</span>
                    <span className="text-sm font-semibold text-[var(--text-muted)]">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feat: string, j: number) => (
                      <li key={j} className="flex items-start gap-3 text-[var(--text)] text-sm font-medium">
                        <Check size={18} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleWhatsApp} className="w-full py-3 rounded-md font-bold text-sm transition-all shadow-sm border" style={{
                    backgroundColor: isPopular ? "var(--accent)" : "transparent",
                    color: isPopular ? "var(--accent-text)" : "var(--text)",
                    borderColor: isPopular ? "var(--accent)" : "var(--card-border)"
                  }}>
                    Choose Plan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LOCATION & CONTACT */}
      <section id="location" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: "var(--accent)" }}>Visit Us</div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text)]">We Are Here For You</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-12 bg-[var(--card)] p-4 sm:p-8 rounded-3xl border border-[var(--card-border)] shadow-sm">
          <div className="lg:w-1/2 rounded-2xl overflow-hidden min-h-[300px] border border-[var(--card-border)]">
            <img src="/google-maps-placeholder.jpeg" alt="Location Map" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80"; }} />
          </div>
          <div className="lg:w-1/2 flex flex-col justify-center py-4">
            <div className="grid sm:grid-cols-2 gap-8 mb-10">
              <div className="flex gap-4">
                <MapPin size={24} className="shrink-0" style={{ color: "var(--accent)" }} />
                <div>
                  <h4 className="font-bold text-[var(--text)] mb-1">Address</h4>
                  <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">{library.address}<br />{library.city}, {library.state || "Rajasthan"}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone size={24} className="shrink-0" style={{ color: "var(--accent)" }} />
                <div>
                  <h4 className="font-bold text-[var(--text)] mb-1">Phone</h4>
                  <p className="text-sm text-[var(--text-muted)] font-medium">{library.phone || library.whatsappNumber || "8875511522"}</p>
                </div>
              </div>
              <div className="flex gap-4 sm:col-span-2">
                <Clock size={24} className="shrink-0" style={{ color: "var(--accent)" }} />
                <div>
                  <h4 className="font-bold text-[var(--text)] mb-1">Hours</h4>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Mon - Sun: {library.openingTime || "08:00 AM"} - {library.closingTime || "10:00 PM"}</p>
                </div>
              </div>
            </div>
            <button onClick={() => window.open(library.googleMapsLink || `https://maps.google.com/?q=${library.address},${library.city}`, '_blank')} className="px-8 py-3.5 rounded-md font-bold text-sm w-fit transition-transform hover:-translate-y-0.5 shadow-md flex items-center gap-2" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
              Get Directions <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[var(--bg-secondary)] rounded-t-[3rem]">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text)]">What Our Students Say</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text)] shadow-sm shrink-0 hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex overflow-hidden gap-6 flex-1 px-2 pb-4">
            {[
              { name: "Rohit Sharma", role: "UPSC Aspirant", text: "The environment here is perfect for serious preparation. Helps me stay focused for long hours.", rating: 5, img: "https://i.pravatar.cc/150?img=11" },
              { name: "Priya Mehta", role: "Student", text: "Great facilities, peaceful atmosphere, and amazing community of learners.", rating: 5, img: "https://i.pravatar.cc/150?img=5" },
              { name: "Aman Verma", role: "Professional", text: "The best place to work and study. Love the 24/7 access and premium cabins.", rating: 5, img: "https://i.pravatar.cc/150?img=12" }
            ].map((test, i) => (
              <div key={i} className="flex-1 min-w-[300px] bg-[var(--card)] p-8 rounded-2xl border border-[var(--card-border)] shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <img src={test.img} alt={test.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-[var(--text)] text-sm">{test.name}</div>
                    <div className="text-xs text-[var(--text-muted)] font-medium">{test.role}</div>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed mb-6">"{test.text}"</p>
                <div className="flex gap-1" style={{ color: "var(--accent)" }}>
                  {[...Array(test.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
              </div>
            ))}
          </div>
          <button className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text)] shadow-sm shrink-0 hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="pt-20 pb-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--footer-bg)", color: "var(--footer-text)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                {library.logoUrl ? (
                  <img src={library.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                ) : (
                  <BookOpen size={32} style={{ color: "var(--accent)" }} />
                )}
                <span className="font-extrabold text-xl tracking-tight uppercase">{library.libraryName}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-6 opacity-70 max-w-sm">
                A premium study space designed to help you focus, learn, and achieve your goals.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-[var(--accent)] transition-colors"><Facebook size={16} /></a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-[var(--accent)] transition-colors"><Instagram size={16} /></a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-[var(--accent)] transition-colors"><Twitter size={16} /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm font-medium opacity-70">
                <li><button onClick={() => scrollTo("home")} className="hover:text-[var(--accent)] transition-colors">Home</button></li>
                <li><button onClick={() => scrollTo("facilities")} className="hover:text-[var(--accent)] transition-colors">Facilities</button></li>
                <li><button onClick={() => scrollTo("gallery")} className="hover:text-[var(--accent)] transition-colors">Gallery</button></li>
                <li><button onClick={() => scrollTo("location")} className="hover:text-[var(--accent)] transition-colors">Location</button></li>
                <li><button onClick={() => scrollTo("contact")} className="hover:text-[var(--accent)] transition-colors">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-base mb-6">Facilities</h4>
              <ul className="space-y-3 text-sm font-medium opacity-70">
                {backendFacilities.slice(0, 5).map((fac: string, i: number) => (
                  <li key={i}>{fac}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-base mb-6">Support</h4>
              <ul className="space-y-3 text-sm font-medium opacity-70">
                <li>Membership Plans</li>
                <li>FAQs</li>
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium opacity-60">
            <div>&copy; {new Date().getFullYear()} {library.libraryName}. All rights reserved.</div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2"><MapPin size={14} /> {library.city}, {library.state || "Rajasthan"}</div>
              <div className="flex items-center gap-2"><Phone size={14} /> {library.phone || library.whatsappNumber || "8875511522"}</div>
              <div className="flex items-center gap-2"><Mail size={14} /> contact@study-space.com</div>
            </div>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setLightboxImg(null)}>
            <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setLightboxImg(null)}>
              <X size={32} />
            </button>
            <img src={lightboxImg} alt="Enlarged Gallery" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
