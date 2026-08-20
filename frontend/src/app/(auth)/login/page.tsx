import React from "react";
import { LoginPageClient } from "./LoginPageClient";

export const metadata = {
  title: "Sign In | FieldOps Workspace",
  description: "Sign in to your FieldOps NIST RBAC enterprise workspace.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
