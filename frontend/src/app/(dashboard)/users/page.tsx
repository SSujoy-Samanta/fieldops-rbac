import type { Metadata } from "next";
import { UsersManager } from "@/components/users/UsersManager";

export const metadata: Metadata = {
  title: "Workforce Directory | FieldOps Enterprise",
  description:
    "Manage organization workforce, provision staff accounts, govern operational roles, and enforce NIST Level 2 access control policies.",
};

export default function UsersPage() {
  return <UsersManager />;
}
