import { Metadata } from "next";
import VisitsManager from "@/components/visits/VisitsManager";

export const metadata: Metadata = {
  title: "Field Visits & Logs | NIST RBAC Operations",
  description:
    "Track and log customer field visits, on-site meetings, and inspections with GPS verification and granular role-based permissions.",
};

export default function VisitsPage() {
  return <VisitsManager />;
}
