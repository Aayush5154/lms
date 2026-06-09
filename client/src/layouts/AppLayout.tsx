import { useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetLibraryConfig } from "@workspace/api-client-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [isLogin] = useRoute("/login");
  const [isSetup] = useRoute("/setup");
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const syncedThemeRef = useRef<string | null>(null);

  const { data: config, isLoading: configLoading } = useGetLibraryConfig({
    query: { enabled: !!token && !isLogin } as any
  });

  const isLoading = authLoading || (!!token && !isLogin && configLoading);

  // Sync theme and language from db config
  useEffect(() => {
    if (config?.theme && config.theme !== syncedThemeRef.current) {
      syncedThemeRef.current = config.theme;
      if (config.theme === "dark" || config.theme === "black-gold") {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    }
    
    if (config?.language && config.language !== i18n.language) {
      i18n.changeLanguage(config.language);
      localStorage.setItem("lms_lang", config.language);
    }
  }, [config?.theme, config?.language, setTheme, i18n]);

  useEffect(() => {
    if (!isLoading) {
      if (!token && !isLogin) {
        setLocation("/login");
      } else if (token && config && !config.setupCompleted && !isSetup && !isLogin) {
        setLocation("/setup");
      } else if (token && config?.setupCompleted && isSetup) {
        setLocation("/");
      }
    }
  }, [token, isLoading, isLogin, isSetup, config, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-primary font-semibold tracking-wider animate-pulse">LOADING...</div>;
  }

  if (isLogin || isSetup) {
    return <>{children}</>;
  }

  if (!token) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="font-bold text-lg text-primary">{t("Dashboard")}</h2>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
