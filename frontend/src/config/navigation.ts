import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  Clock,
  Compass,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PERMISSION_KEY } from "@/types/rbac";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
  permission?: PERMISSION_KEY;
  anyPermissions?: PERMISSION_KEY[];
  description?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    title: "Operations",
    items: [
      {
        title: "Overview",
        url: "/overview",
        icon: LayoutDashboard,
        description: "Live operational metrics and shift status",
      },
      {
        title: "My Attendance",
        url: "/attendance",
        icon: CalendarCheck,
        permission: PERMISSION_KEY.READ_SELF_ATTENDANCE,
        description: "Personal shift history & punch logs",
      },
      {
        title: "My Visits",
        url: "/visits",
        icon: MapPin,
        permission: PERMISSION_KEY.READ_SELF_VISIT,
        description: "Personal customer visit records & GPS check-ins",
      },
    ],
  },
  {
    title: "Team Management",
    items: [
      {
        title: "Team Attendance",
        url: "/team-attendance",
        icon: Clock,
        permission: PERMISSION_KEY.READ_ALL_ATTENDANCE,
        description: "Company-wide shift monitoring & attendance stats",
      },
      {
        title: "Team Visits",
        url: "/team-visits",
        icon: Compass,
        permission: PERMISSION_KEY.READ_ALL_VISIT,
        description: "Field team customer visits & location reports",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "User Directory",
        url: "/users",
        icon: Users,
        permission: PERMISSION_KEY.MANAGE_USERS,
        description: "Staff accounts & role assignments",
      },
      {
        title: "Roles & Permissions",
        url: "/roles",
        icon: ShieldCheck,
        permission: PERMISSION_KEY.MANAGE_ROLES,
        description: "Granular RBAC matrix & policy editor",
      },
    ],
  },
];