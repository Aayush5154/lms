import { useRoute } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useGetPublicLibrary } from "@workspace/api-client-react";
import { MapPin, Wifi, Wind, Coffee, Monitor, Shield, Zap, Book, Building2, Users } from "lucide-react";
import { getTheme } from "@/utils/websiteThemes";

const MOBILE_STYLES = `
@media (max-width: 640px) {
  .pub-header-inner { flex-wrap: wrap; gap: 0.75rem; height: auto !important; padding: 0.75rem 1rem !important; }
  .pub-header-left { flex: 1 1 100%; }
  .pub-header-right { flex: 1 1 100%; justify-content: space-between; }
  .pub-hours-grid { grid-template-columns: 1fr !important; }
  .pub-features-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 2rem 0.75rem !important; }
  .pub-photo-grid { grid-template-columns: repeat(2, 1fr) !important; grid-template-rows: auto !important; }
  .pub-photo-grid > div { grid-row: auto !important; min-height: 130px !important; }
  .pub-ticker-item { width: 130px !important; height: 86px !important; }
  .pub-section { padding: 3rem 1rem !important; }
  .pub-footer-links { flex-direction: column; gap: 1.5rem !important; }
  .pub-footer-inner { flex-direction: column; gap: 1.5rem; }
  .pub-hero h1 { font-size: clamp(2rem, 8vw, 3.5rem) !important; }
  .pub-map-box { min-height: 220px !important; }
}
@media (max-width: 400px) {
  .pub-photo-grid { grid-template-columns: 1fr !important; }
  .pub-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
`;

export default function PublicLibrary() {
  const [, params] = useRoute("/library/:id");
  const id = params?.id;

  const { data: library, isLoading, error } = useGetPublicLibrary(id || "", {
    query: { enabled: !!id } as any,
  });

  // MUST be before any early returns to respect Rules of Hooks
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "pub-lib-mobile";
    el.textContent = MOBILE_STYLES;
    document.head.appendChild(el);
    return () => { document.getElementById("pub-lib-mobile")?.remove(); };
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", color: "#FFD700", fontSize: "1.25rem", fontWeight: "bold" }}>
        Loading Library...
      </div>
    );
  }

  if (error || !library) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", color: "#FFFFFF", fontSize: "1.25rem" }}>
        Library not found or is currently unavailable.
      </div>
    );
  }

  const theme = getTheme((library as any).websiteTheme);
  const t = theme.vars;

  const handleWhatsApp = () => {
    if (library.whatsappNumber) {
      window.open(
        `https://wa.me/${library.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi, I would like to inquire about admission to ${library.libraryName}`,
        "_blank"
      );
    }
  };

  // Inline style helpers so we never touch admin CSS vars
  const s = {
    page: { background: t.bg, color: t.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" } as React.CSSProperties,
    header: { background: t.headerBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.cardBorder}`, position: "sticky" as const, top: 0, zIndex: 50 },
    headerInner: { maxWidth: "72rem", margin: "0 auto", padding: "0 1rem", height: "5rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logoBox: { width: "3rem", height: "3rem", borderRadius: "0.5rem", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: t.accentText, fontWeight: 700, fontSize: "1.25rem" },
    badge: { display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", background: `${t.accent}18`, color: t.accent, fontSize: "0.875rem", fontWeight: 600, border: `1px solid ${t.accent}33` },
    btnPrimary: { background: t.accent, color: t.accentText, border: "none", borderRadius: "0.75rem", padding: "0.875rem 2rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: `0 4px 24px ${t.accent}40` },
    btnOutline: { background: "transparent", color: t.accent, border: `2px solid ${t.accent}`, borderRadius: "0.75rem", padding: "0.875rem 2rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
    btnEnquire: { background: t.accent, color: t.accentText, border: "none", borderRadius: "0.5rem", padding: "0.5rem 1.25rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" },
    section: { padding: "5rem 1rem" },
    sectionAlt: { padding: "5rem 1rem", background: `${t.bgSecondary}`, borderTop: `1px solid ${t.cardBorder}`, borderBottom: `1px solid ${t.cardBorder}` },
    inner: { maxWidth: "72rem", margin: "0 auto" },
    inner5: { maxWidth: "60rem", margin: "0 auto" },
    card: { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: "0.75rem", padding: "1rem", boxShadow: "0 1px 8px rgba(0,0,0,0.12)" },
    facilityCard: { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem", transition: "border-color 0.2s" },
    galleryImg: { width: "100%", height: "100%", objectFit: "cover" as const, transition: "transform 0.5s" },
    footer: { background: t.footerBg, color: t.footerText, padding: "4rem 1rem" },
    footerBorder: { borderTop: `1px solid ${t.footerBorder}` },
    muted: { color: t.textMuted },
    accent: { color: t.accent },
  };

  const heroImage = library.coverImageUrl || (library.galleryImages && library.galleryImages[0]) || "";
  
  const getFacilityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("wifi")) return <Wifi style={{ width: "2.5rem", height: "2.5rem" }} />;
    if (n.includes("ac") || n.includes("air")) return <Wind style={{ width: "2.5rem", height: "2.5rem" }} />;
    if (n.includes("water") || n.includes("coffee") || n.includes("tea")) return <Coffee style={{ width: "2.5rem", height: "2.5rem" }} />;
    if (n.includes("computer") || n.includes("print")) return <Monitor style={{ width: "2.5rem", height: "2.5rem" }} />;
    if (n.includes("security") || n.includes("cctv")) return <Shield style={{ width: "2.5rem", height: "2.5rem" }} />;
    if (n.includes("power") || n.includes("charging")) return <Zap style={{ width: "2.5rem", height: "2.5rem" }} />;
    if (n.includes("discussion") || n.includes("meeting")) return <Users style={{ width: "2.5rem", height: "2.5rem" }} />;
    if (n.includes("newspaper") || n.includes("magazine") || n.includes("book")) return <Book style={{ width: "2.5rem", height: "2.5rem" }} />;
    return <Building2 style={{ width: "2.5rem", height: "2.5rem" }} />;
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={{ ...s.header, background: t.bg, backdropFilter: "none", borderBottom: `1px solid ${t.cardBorder}` }}>
        <div className="pub-header-inner" style={s.headerInner}>
          <div className="pub-header-left" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {library.logoUrl ? (
              <img src={library.logoUrl} alt={library.libraryName} loading="eager" decoding="async" style={{ height: "3rem", width: "3rem", borderRadius: "0.5rem", objectFit: "cover", border: `1px solid ${t.cardBorder}` }} />
            ) : (
              <div style={s.logoBox}>{library.libraryName.substring(0, 2).toUpperCase()}</div>
            )}
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: t.text, letterSpacing: "-0.02em", margin: "0 auto" }}>
              {library.libraryName}
            </div>
          </div>
          <div className="pub-header-right" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: t.textMuted }}>
              <MapPin style={{ width: "1.1rem", height: "1.1rem" }} />
              {library.city || "Location"}
            </span>
            <button style={{ ...s.btnEnquire, background: t.accent, borderRadius: "4px" }} onClick={handleWhatsApp}>
              JOIN TODAY
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pub-hero" style={{
        position: "relative",
        width: "100%",
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: heroImage ? `url(${heroImage}) center/cover no-repeat` : `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }}></div>
        <h1 style={{ 
          position: "relative", 
          zIndex: 10, 
          color: "#fff", 
          fontSize: "clamp(3rem, 6vw, 5rem)", 
          fontWeight: 900, 
          textTransform: "uppercase", 
          letterSpacing: "0.05em",
          textAlign: "center",
          padding: "0 1rem",
          textShadow: "0 4px 24px rgba(0,0,0,0.5)"
        }}>
          {library.libraryName}
        </h1>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: "72rem", margin: "-3rem auto 4rem", position: "relative", zIndex: 20, padding: "0 1rem" }}>
        
        {/* Hours & Location Box */}
        <div className="pub-hours-grid" style={{
          background: t.card,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "350px",
        } as any}>
          
          <div style={{ padding: "3rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Hours & Location
            </div>
            
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: t.text, margin: 0 }}>
              {library.libraryName}
            </h2>
            
            <div>
              <span style={{ 
                display: "inline-block", 
                background: t.accent, 
                color: t.accentText, 
                padding: "0.25rem 1rem", 
                fontSize: "0.75rem", 
                fontWeight: 800, 
                letterSpacing: "0.05em", 
                textTransform: "uppercase",
                marginBottom: "1rem"
              }}>
                Open Today
              </span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.875rem", color: t.textMuted }}>
              <div>
                <div style={{ marginBottom: "0.25rem" }}>Mon - Sun:</div>
                <div style={{ color: t.text, fontWeight: 600 }}>{library.openingTime || "08:00 AM"} - {library.closingTime || "10:00 PM"}</div>
              </div>
            </div>
            
            <div style={{ marginTop: "1rem", paddingTop: "1.5rem", borderTop: `1px solid ${t.cardBorder}` }}>
              <p style={{ fontSize: "0.9rem", color: t.text, marginBottom: "0.5rem" }}>
                {library.address}
              </p>
              <p style={{ fontSize: "0.9rem", color: t.text, marginBottom: "1rem" }}>
                {library.city}{library.state ? `, ${library.state}` : ""}
              </p>
              {library.phone && (
                <p style={{ fontSize: "0.9rem", color: t.textMuted }}>
                  Centralized Info: <a href={`tel:${library.phone}`} style={{ color: t.text, textDecoration: "underline" }}>{library.phone}</a>
                </p>
              )}
            </div>
          </div>
          
          <div className="pub-map-box" style={{ background: t.bgSecondary, position: "relative", minHeight: "300px", overflow: "hidden" }}>
            {library.googleMapsLink ? (
              <a
                href={library.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", width: "100%", height: "100%", minHeight: "300px", position: "relative", textDecoration: "none" }}
                title="Open in Google Maps"
              >
                <img
                  src="/google-maps-placeholder.jpeg"
                  alt="Open in Google Maps"
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: "300px" }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}>
                  <div style={{
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#1a73e8",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                  }}>
                    <MapPin style={{ width: "1.1rem", height: "1.1rem" }} />
                    View on Google Maps
                  </div>
                </div>
              </a>
            ) : (
              <div style={{ width: "100%", height: "100%", minHeight: "300px", position: "relative", overflow: "hidden" }}>
                <img
                  src="/google-maps-placeholder.jpeg"
                  alt="Google Maps"
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: "300px", opacity: 0.6 }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <div style={{
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "#555",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                  }}>
                    <MapPin style={{ width: "1.1rem", height: "1.1rem" }} />
                    Location not available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
      </section>

      {/* Features Section — middle of page */}
      <section className="pub-section" style={{ padding: "5rem 1rem", background: t.bgSecondary, borderTop: `1px solid ${t.cardBorder}`, borderBottom: `1px solid ${t.cardBorder}` }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: t.text, display: "inline-block", position: "relative" }}>
              Features
              <div style={{ position: "absolute", bottom: "-1rem", left: "50%", transform: "translateX(-50%)", width: "3rem", height: "4px", background: t.accent }}></div>
            </h2>
          </div>

          <div className="pub-features-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "3rem 1rem",
            textAlign: "center"
          }}>
            {(library.facilities && library.facilities.length > 0 ? library.facilities : [
              "High Speed WiFi", "Quiet Study Rooms", "RO Drinking Water", "Comfortable Chairs",
              "Charging Ports", "CCTV Security", "Discussion Room", "Daily Newspapers",
            ]).map((facility: string, i: number) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: t.text }}>
                <div style={{
                  width: "3.5rem", height: "3.5rem",
                  borderRadius: "1rem",
                  background: `${t.accent}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: t.accent,
                }}>
                  {getFacilityIcon(facility)}
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.9rem", maxWidth: "130px", lineHeight: 1.4, color: t.text }}>
                  {facility}
                </span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <button
              onClick={handleWhatsApp}
              style={{
                background: t.accent,
                color: t.accentText,
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.875rem 2.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 4px 24px ${t.accent}40`,
              }}
            >
              Explore {library.libraryName}
            </button>
          </div>
        </div>
      </section>

      {/* Photo Grid Section */}
      {library.galleryImages && library.galleryImages.length > 0 && (
        <PhotoGrid images={library.galleryImages as string[]} t={t} />
      )}

      {/* Footer */}
      <footer style={{ background: t.footerBg || t.card, color: t.footerText || t.text, padding: "4rem 1rem 2rem", borderTop: `1px solid ${t.cardBorder}` }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "2rem", marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {library.logoUrl ? (
                <img src={library.logoUrl} alt={library.libraryName} loading="lazy" decoding="async" style={{ height: "4rem", width: "4rem", borderRadius: "0.5rem", objectFit: "cover", filter: "grayscale(100%) brightness(200%)" }} />
              ) : (
                <div style={{ ...s.logoBox, background: t.text, color: t.bg }}>{library.libraryName.substring(0, 2).toUpperCase()}</div>
              )}
              <div style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", maxWidth: "150px", lineHeight: 1.2 }}>
                {library.libraryName}
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "4rem", fontSize: "0.875rem", fontWeight: 600 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <a href="#" style={{ color: t.textMuted, textDecoration: "none" }}>ABOUT THE LIBRARY</a>
                <a href="#" style={{ color: t.textMuted, textDecoration: "none" }}>JOBS AT THE LIBRARY</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <a href="#" style={{ color: t.textMuted, textDecoration: "none" }}>CONTACT US</a>
                <a href="#" style={{ color: t.textMuted, textDecoration: "none" }}>HOURS & LOCATIONS</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <span style={{ color: t.textMuted, marginBottom: "0.5rem" }}>FOLLOW</span>
                <a href="#" style={{ color: t.text, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "1.2rem", height: "1.2rem", background: t.text, borderRadius: "2px" }}></div>
                  Facebook
                </a>
                <a href="#" style={{ color: t.text, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "1.2rem", height: "1.2rem", background: t.text, borderRadius: "2px" }}></div>
                  Instagram
                </a>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: `1px solid ${t.cardBorder}`, paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: t.textMuted, flexWrap: "wrap", gap: "1rem" }}>
            <div>&copy; {new Date().getFullYear()} {library.libraryName}</div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Accessibility</a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Library Services Agreement</a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PhotoGrid({ images, t }: { images: string[]; t: Record<string, string> }) {
  // Cap grid at 6, use all for the ticker
  const gridImages = images.slice(0, 6);
  // For ticker: duplicate for seamless loop
  const ticker = [...images, ...images];

  const rafRef = useRef<number | null>(null);
  const speedRef = useRef(0.4); // px per frame
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let offset = 0;
    let lastTime = 0;
    const tick = (now: number) => {
      if (now - lastTime > 16) {
        const itemW = 200;
        const half = images.length * itemW;
        offset = offset >= half ? 0 : offset + speedRef.current;
        if (stripRef.current) stripRef.current.style.transform = `translateX(-${offset}px)`;
        lastTime = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [images.length]);

  return (
    <section style={{ background: t.bg, padding: "4rem 0" }}>
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1rem" }}>
        {/* Section label */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: t.textMuted,
          }}>Photo Gallery</span>
        </div>

        {/* Photo grid — max 6, layout adapts to count */}
        <div className="pub-photo-grid" style={{
          display: "grid",
          gridTemplateColumns: gridImages.length === 1
            ? "1fr"
            : gridImages.length === 2
            ? "1fr 1fr"
            : gridImages.length <= 4
            ? "repeat(2, 1fr)"
            : "repeat(3, 1fr)",
          gridTemplateRows: gridImages.length <= 3 ? "auto" : gridImages.length <= 4 ? "repeat(2, 240px)" : "repeat(2, 220px)",
          gap: "0.75rem",
          borderRadius: "1rem",
          overflow: "hidden",
        }}>
          {gridImages.map((src, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                overflow: "hidden",
                // First image spans 2 rows when we have 5 or 6 images
                gridRow: i === 0 && gridImages.length >= 5 ? "span 2" : undefined,
                minHeight: "200px",
                background: t.bgSecondary,
              }}
            >
              <img
                src={src}
                alt={`Gallery ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.4s ease",
                  minHeight: "200px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal auto-scrolling ticker strip */}
      {images.length > 1 && (
        <div
          ref={containerRef}
          style={{
            marginTop: "2rem",
            overflow: "hidden",
            width: "100%",
            position: "relative",
          }}
          onMouseEnter={() => { speedRef.current = 0; }}
          onMouseLeave={() => { speedRef.current = 0.4; }}
        >
          <div
            ref={stripRef}
            style={{
              display: "flex",
              gap: "0.75rem",
              width: "max-content",
              transform: "translateX(0)",
              willChange: "transform",
            }}
          >
            {ticker.map((src, i) => (
              <div
                key={i}
                className="pub-ticker-item"
                style={{
                  width: "180px",
                  height: "120px",
                  flexShrink: 0,
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  border: `1px solid ${t.cardBorder}`,
                }}
              >
                <img
                  src={src}
                  alt={`Ticker ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            ))}
          </div>
          {/* Fade edges */}
          <div style={{ position: "absolute", inset: "0 auto 0 0", width: "4rem", background: `linear-gradient(to right, ${t.bg}, transparent)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: "0 0 0 auto", width: "4rem", background: `linear-gradient(to left, ${t.bg}, transparent)`, pointerEvents: "none" }} />
        </div>
      )}
    </section>
  );
}
