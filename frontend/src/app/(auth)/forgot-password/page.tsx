"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      const msg = "Please enter your registered work email.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authApi.forgotPassword({ email });
      setIsSuccess(true);
      toast.success("Password reset instructions dispatched to your email.");
    } catch (err: unknown) {
      const msg =
        getErrorMessage(err) || "Failed to submit reset request. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard
        title="Forgot Password?"
        subtitle="Enter your registered work email to receive recovery instructions."
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
              <h3 className="text-lg font-bold">Reset Instructions Dispatched</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                If an account with <span className="font-semibold text-foreground">{email}</span> exists,
                we have sent password reset instructions to your inbox.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-3">
              <Link href="/reset-password" className="w-full">
                <AuthButton>
                  Have a Reset Token? Enter Here
                </AuthButton>
              </Link>

              <Link href="/login" className="w-full">
                <AuthButton variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </AuthButton>
              </Link>
            </div>
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Registered Work Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
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

            <AuthButton
              type="submit"
              isLoading={isLoading}
              loadingText="Sending Instructions..."
              className="mt-2"
            >
              Send Reset Link
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
