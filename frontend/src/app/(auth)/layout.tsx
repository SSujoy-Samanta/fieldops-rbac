import React, { Suspense } from "react";
import { GuestGuard } from "@/components/GuestGuard";

export const metadata = {
  title: "Authentication | FieldOps",
  description: "Secure NIST RBAC Enterprise Authentication for FieldOps",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <GuestGuard>{children}</GuestGuard>
    </Suspense>
  );
}
