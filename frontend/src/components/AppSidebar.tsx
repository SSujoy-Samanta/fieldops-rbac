"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wordmark } from "@/components/brand/Wordmark";
import { navigationSections } from "@/config/navigation";
import { useUser } from "@/hooks/useUser";
import { usePermissions } from "@/hooks/usePermissions";
import { authApi } from "@/lib/api";
import { SYSTEM_ROLE } from "@/types/rbac";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const { roleName, can, canAny } = usePermissions();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue cleanup
    } finally {
      setUser(null);
      toast.info("Logged out of workspace.");
      router.push("/login");
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "FO";

  // Filter sections by RBAC permissions
  const visibleSections = useMemo(() => {
    return navigationSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (item.permission) return can(item.permission);
          if (item.anyPermissions && item.anyPermissions.length > 0) {
            return canAny(item.anyPermissions);
          }
          return true;
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [can, canAny]);

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar md:before:absolute md:before:top-0 md:before:-right-[1px] md:before:h-16 md:before:w-[2px] md:before:bg-sidebar md:before:z-50 overflow-visible">
      {/* ── Header: Brand Wordmark ────────────────────────────────────── */}
      <SidebarHeader className="p-0 gap-0 border-b border-sidebar-border bg-sidebar shrink-0">
        <div className="flex items-center h-16 px-4">
          <Wordmark size="sm" href="/overview" />
        </div>
      </SidebarHeader>

      {/* ── Content: Navigation Sections ─────────────────────────────── */}
      <SidebarContent className="p-3 gap-6 bg-sidebar">
        {visibleSections.map((section) => {
          return (
            <SidebarGroup key={section.title} className="p-0">
              <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1">
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.url ||
                      (item.url !== "/overview" && pathname.startsWith(item.url));
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          render={
                            <Link
                              href={item.url}
                              onClick={() => isMobile && setOpenMobile(false)}
                            />
                          }
                          isActive={isActive}
                          className={cn(
                            "h-10 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2",
                            isActive
                              ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold shadow-md shadow-orange-500/25 dark:shadow-orange-500/20 border-2 border-orange-500/50"
                              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:border-border/60 border-2 border-transparent"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive
                                ? "text-orange-500"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          <span className="truncate">{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* ── Footer: User Profile, Role Badge & Logout ────────────────── */}
      <SidebarFooter className="p-3 border-t border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-9 w-9 border border-orange-500/30 shrink-0">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {user?.name || "Team Member"}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-md border tracking-wider uppercase font-mono leading-none",
                    roleName === SYSTEM_ROLE.OWNER
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : roleName === SYSTEM_ROLE.MANAGER
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  )}
                >
                  {roleName || "MEMBER"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log Out</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
