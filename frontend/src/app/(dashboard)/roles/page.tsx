import type { Metadata } from "next";
import { RolesManager } from "@/components/roles/RolesManager";

export const metadata: Metadata = {
  title: "Roles & Permissions | FieldOps Enterprise",
  description:
    "Configure fine-grained NIST Level 2 RBAC access control policies, role definitions, and permission matrices with real-time tag-based cache invalidation.",
};

export default function RolesPage() {
  return <RolesManager />;
}
