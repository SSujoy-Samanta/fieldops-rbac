import type { Metadata } from "next";
import { TeamAttendanceManager } from "@/components/team-attendance/TeamAttendanceManager";

export const metadata: Metadata = {
  title: "Team Attendance & Workforce Shifts | FieldOps Enterprise",
  description:
    "Monitor real-time employee check-ins, active shift durations, GPS verification, and workforce operational metrics.",
};

export default function TeamAttendancePage() {
  return <TeamAttendanceManager />;
}
