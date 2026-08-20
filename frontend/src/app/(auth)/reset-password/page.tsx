"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      const msg = "Please provide a valid reset token.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (newPassword.length < 8) {
      const msg = "Password must be at least 8 characters long.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "Passwords do not match.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authApi.resetPassword({
        token,
        newPassword,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      const msg =
        getErrorMessage(err) || "Failed to reset password. The token may be expired.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard
        title="Set New Password"
        subtitle="Enter your security reset token and choose a strong new password."
      >
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 py-2"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Password Reset Successfully</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your password has been updated. Redirecting you to the sign-in page...
              </p>
            </div>

            <Link href="/login" className="w-full mt-3">
              <AuthButton>
                Sign In Now
              </AuthButton>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            {/* Token Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="token" className="text-sm font-semibold">
                Security Reset Token
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="token"
                  type="text"
                  placeholder="Paste token received via email / audit log"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isLoading}
                  required
                  suppressHydrationWarning
                  className="pl-11 h-11 md:h-12 rounded-xl bg-background/50 border-border/70 focus-visible:border-orange-500/70 focus-visible:ring-orange-500/30 text-sm md:text-base font-mono transition-all"
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={8}
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

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={8}
                  suppressHydrationWarning
                  className="pl-11 pr-11 h-11 md:h-12 rounded-xl bg-background/50 border-border/70 focus-visible:border-orange-500/70 focus-visible:ring-orange-500/30 text-sm md:text-base font-mono transition-all"
                />
              </div>
            </div>

            <AuthButton
              type="submit"
              isLoading={isLoading}
              loadingText="Updating Password..."
              className="mt-2"
            >
              Update Password
            </AuthButton>

            <div className="flex items-center justify-start text-sm text-muted-foreground pt-4 border-t border-border/40">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 hover:text-foreground font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthContainer>
  );
}
