"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    toast.info("Logged out of workspace.");
    router.push("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "FO";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative flex flex-col min-h-screen bg-background">
        {/* ── Top Navigation Bar ──────────────────────────────────────── */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 md:px-6 transition-colors">
          {/* Mobile Sidebar Trigger (Hidden on Desktop) */}
          <div className="flex items-center gap-2 lg:hidden">
            <SidebarTrigger className="-ml-1" />
          </div>

          {/* Right Actions & Profile */}
          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            <ThemeToggle />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-orange-500/30 transition-all outline-none cursor-pointer">
                <Avatar className="h-8 w-8 border border-orange-500/40">
                  {user?.avatar && (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  )}
                  <AvatarFallback className="bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl"
              >
                <div className="px-2.5 py-2 flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </p>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Main Dashboard Workspace ────────────────────────────────── */}
        <main className="relative flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardShell;
