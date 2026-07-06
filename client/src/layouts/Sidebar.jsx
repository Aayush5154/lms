import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Grid, CreditCard, Receipt, BarChart3, Settings, LogOut, Shield, Tags } from "lucide-react";
function AppSidebar() {
  const [location] = useLocation();
  const { logout, admin } = useAuth();
  const { t } = useTranslation();
  const isSuperAdmin = admin?.role === "super_admin";
  const navigation = [
    { name: t("Dashboard"), href: "/", icon: LayoutDashboard },
    { name: t("Students"), href: "/students", icon: Users },
    { name: t("Seats Layout"), href: "/seats", icon: Grid },
    { name: t("Fees & Payments"), href: "/fees", icon: CreditCard },
    { name: t("Recent Payments"), href: "/payments", icon: Receipt },
    { name: t("Reports"), href: "/reports", icon: BarChart3 },
    { name: t("Settings"), href: "/settings", icon: Settings },
    { name: t("Pricing Plans"), href: "/plans", icon: Tags },
    ...isSuperAdmin ? [{ name: t("Super Admin"), href: "/super-admin", icon: Shield }] : []
  ];
  return <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Grid className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-lg text-white tracking-tight">{admin?.libraryName || "Library OS"}</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location === item.href}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4 mr-2.5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {admin?.name?.substring(0, 2).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{admin?.name}</p>
            <p className="text-xs text-white/60 truncate">{admin?.email}</p>
          </div>
          <button onClick={logout} className="p-2 hover:bg-white/15 rounded-lg text-white/70 hover:text-white transition-all" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>;
}
export {
  AppSidebar
};
