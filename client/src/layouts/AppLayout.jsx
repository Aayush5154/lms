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
function AppLayout({ children }) {
  const { token, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [isLogin] = useRoute("/login");
  const [isSetup] = useRoute("/setup");
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const syncedThemeRef = useRef(null);
  const { data: config, isLoading: configLoading } = useGetLibraryConfig({
    query: { enabled: !!token && !isLogin }
  });
  const isLoading = authLoading || !!token && !isLogin && configLoading;
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
  return <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h2 className="font-bold text-lg text-foreground">{t("Dashboard")}</h2>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>;
}
export {
  AppLayout
};
