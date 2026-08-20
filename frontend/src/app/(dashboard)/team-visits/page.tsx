import { Metadata } from "next";
import TeamVisitsManager from "@/components/team-visits/TeamVisitsManager";

export const metadata: Metadata = {
  title: "Team Field Visits & Activity | NIST RBAC Operations",
  description:
    "Monitor company-wide customer visits, sales meetings, and inspection logs across field staff with real-time audit controls.",
};

export default function TeamVisitsPage() {
  return <TeamVisitsManager />;
}
