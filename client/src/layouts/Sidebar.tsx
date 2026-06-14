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
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Grid, CreditCard, Receipt, BarChart3, Settings, LogOut, Shield, Tags } from "lucide-react";

export function AppSidebar() {
  const [location] = useLocation();
  const { logout, admin } = useAuth();
  const { t } = useTranslation();

  const isSuperAdmin = (admin as any)?.role === "super_admin";

  const navigation = [
    { name: t("Dashboard"), href: "/", icon: LayoutDashboard },
    { name: t("Students"), href: "/students", icon: Users },
    { name: t("Seats Layout"), href: "/seats", icon: Grid },
    { name: t("Fees & Payments"), href: "/fees", icon: CreditCard },
    { name: t("Recent Payments"), href: "/payments", icon: Receipt },
    { name: t("Reports"), href: "/reports", icon: BarChart3 },
    { name: t("Settings"), href: "/settings", icon: Settings },
    { name: t("Pricing Plans"), href: "/plans", icon: Tags },
    ...(isSuperAdmin ? [{ name: t("Super Admin"), href: "/super-admin", icon: Shield }] : []),
  ];

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b">
        <h1 className="font-bold text-xl text-primary text-center">{admin?.libraryName || "Library OS"}</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location === item.href}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4 mr-2" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{admin?.name}</span>
            <span className="text-xs text-muted-foreground">{admin?.email}</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
