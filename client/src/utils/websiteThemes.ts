// Website theme definitions for the public library page
// Each theme is completely isolated from the admin dashboard

export interface WebsiteTheme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  // CSS vars applied to the public page wrapper
  vars: {
    bg: string;
    bgSecondary: string;
    card: string;
    cardBorder: string;
    accent: string;
    accentHover: string;
    accentText: string; // text color ON the accent bg
    text: string;
    textMuted: string;
    footerBg: string;
    footerText: string;
    footerMuted: string;
    footerBorder: string;
    headerBg: string;
    gradientFrom: string;
    gradientTo: string;
  };
}

export const WEBSITE_THEMES: WebsiteTheme[] = [
  {
    id: "black-gold",
    name: "Black Gold Premium",
    description: "Black background, gold accent — luxury feel",
    emoji: "⭐",
    vars: {
      bg: "#0A0A0A",
      bgSecondary: "#161616",
      card: "#1a1a1a",
      cardBorder: "#2a2a2a",
      accent: "#FFD700",
      accentHover: "#FFC000",
      accentText: "#000000",
      text: "#FFFFFF",
      textMuted: "#888888",
      footerBg: "#000000",
      footerText: "#FFFFFF",
      footerMuted: "#666666",
      footerBorder: "#1f1f1f",
      headerBg: "rgba(10,10,10,0.9)",
      gradientFrom: "#FFD700",
      gradientTo: "#FFF0A0",
    },
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Dark blue background, light blue accent — tech feel",
    emoji: "🌙",
    vars: {
      bg: "#0B1120",
      bgSecondary: "#0F172A",
      card: "#1E293B",
      cardBorder: "#334155",
      accent: "#38BDF8",
      accentHover: "#0EA5E9",
      accentText: "#000000",
      text: "#F1F5F9",
      textMuted: "#64748B",
      footerBg: "#020617",
      footerText: "#F1F5F9",
      footerMuted: "#475569",
      footerBorder: "#1E293B",
      headerBg: "rgba(11,17,32,0.92)",
      gradientFrom: "#38BDF8",
      gradientTo: "#BAE6FD",
    },
  },
  {
    id: "black-white-minimal",
    name: "Black White Minimal",
    description: "Black background, white accent — ultra clean",
    emoji: "◼",
    vars: {
      bg: "#0D0D0D",
      bgSecondary: "#141414",
      card: "#1C1C1C",
      cardBorder: "#2E2E2E",
      accent: "#FFFFFF",
      accentHover: "#D4D4D4",
      accentText: "#000000",
      text: "#FFFFFF",
      textMuted: "#777777",
      footerBg: "#000000",
      footerText: "#FFFFFF",
      footerMuted: "#555555",
      footerBorder: "#222222",
      headerBg: "rgba(13,13,13,0.92)",
      gradientFrom: "#FFFFFF",
      gradientTo: "#AAAAAA",
    },
  },
  {
    id: "classic-blue",
    name: "Classic Blue",
    description: "White background, blue accent — professional educational",
    emoji: "🎓",
    vars: {
      bg: "#F8FAFF",
      bgSecondary: "#EFF4FF",
      card: "#FFFFFF",
      cardBorder: "#DBEAFE",
      accent: "#2563EB",
      accentHover: "#1D4ED8",
      accentText: "#FFFFFF",
      text: "#0F172A",
      textMuted: "#64748B",
      footerBg: "#1E3A8A",
      footerText: "#FFFFFF",
      footerMuted: "#93C5FD",
      footerBorder: "#1E40AF",
      headerBg: "rgba(248,250,255,0.95)",
      gradientFrom: "#2563EB",
      gradientTo: "#60A5FA",
    },
  },
  {
    id: "modern-emerald",
    name: "Modern Emerald",
    description: "White background, green accent — fresh modern",
    emoji: "🌿",
    vars: {
      bg: "#F0FDF4",
      bgSecondary: "#DCFCE7",
      card: "#FFFFFF",
      cardBorder: "#BBF7D0",
      accent: "#16A34A",
      accentHover: "#15803D",
      accentText: "#FFFFFF",
      text: "#0F172A",
      textMuted: "#6B7280",
      footerBg: "#052E16",
      footerText: "#FFFFFF",
      footerMuted: "#6EE7B7",
      footerBorder: "#064E3B",
      headerBg: "rgba(240,253,244,0.95)",
      gradientFrom: "#16A34A",
      gradientTo: "#4ADE80",
    },
  },
  {
    id: "premium-purple",
    name: "Warm Beige",
    description: "Warm beige & white — elegant, cozy, premium",
    emoji: "🤎",
    vars: {
      bg: "#FAF7F2",
      bgSecondary: "#F3EDE4",
      card: "#FFFFFF",
      cardBorder: "#E8DFD1",
      accent: "#8B6914",
      accentHover: "#745810",
      accentText: "#FFFFFF",
      text: "#2C2418",
      textMuted: "#8C7E6A",
      footerBg: "#2C2418",
      footerText: "#FAF7F2",
      footerMuted: "#B5A898",
      footerBorder: "#3D3225",
      headerBg: "rgba(250,247,242,0.95)",
      gradientFrom: "#8B6914",
      gradientTo: "#C9A84C",
    },
  },
];

export function getTheme(id?: string): WebsiteTheme {
  return WEBSITE_THEMES.find((t) => t.id === id) ?? WEBSITE_THEMES[0]!;
}
