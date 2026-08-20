"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { OAuthDivider } from "@/components/auth/OAuthDivider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/useUser";

export function LoginPageClient() {
  const { setUser } = useUser();
  const searchParams = useSearchParams();
  const returnToParam = searchParams.get("returnTo");
  const returnTo =
    returnToParam && returnToParam.startsWith("/") && !returnToParam.startsWith("//")
      ? returnToParam
      : "/overview";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      const msg = "Please enter both email and password.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.login({ email, password });
      if (res.data?.user) {
        setUser(res.data.user);
      }
      toast.success("Welcome back! Signing in to workspace...");
      window.location.href = returnTo;
    } catch (err: unknown) {
      const msg =
        getErrorMessage(err) || "Failed to sign in. Please verify your credentials.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to your account to continue"
      >
        <div className="flex flex-col gap-6">
          {/* ── Google OAuth ────────────────────────────────────────────── */}
          <OAuthButtons returnTo={returnTo} />

          {/* ── Divider ─────────────────────────────────────────────────── */}
          <OAuthDivider />

          {/* ── Error Banner ────────────────────────────────────────────── */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-sm text-rose-500"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </motion.div>
          )}

          {/* ── Credentials Form ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email" className="text-sm font-semibold">
                Work Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@fieldops.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                  suppressHydrationWarning
                  className="pl-11 h-11 md:h-12 rounded-xl bg-background/50 border-border/70 focus-visible:border-orange-500/70 focus-visible:ring-orange-500/30 text-sm md:text-base transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-0.5">
                <Label htmlFor="login-password" className="text-sm font-semibold">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-semibold hover:underline underline-offset-4 transition-all"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  suppressHydrationWarning
                  className="pl-11 pr-11 h-11 md:h-12 rounded-xl bg-background/50 border-border/70 focus-visible:border-orange-500/70 focus-visible:ring-orange-500/30 text-sm md:text-base font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <AuthButton
              type="submit"
              isLoading={isLoading}
              loadingText="Signing in..."
              className="mt-2"
            >
              Sign In to Workspace
            </AuthButton>
          </form>
        </div>
      </AuthCard>
    </AuthContainer>
  );
}

export default LoginPageClient;
