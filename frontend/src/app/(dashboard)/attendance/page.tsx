import type { Metadata } from "next";
import { AttendanceManager } from "@/components/attendance/AttendanceManager";

export const metadata: Metadata = {
  title: "My Attendance & Shifts | FieldOps Enterprise",
  description:
    "Track active shift hours, punch in with GPS verification, and review personal attendance records.",
};

export default function AttendancePage() {
  return <AttendanceManager />;
}
