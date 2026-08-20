"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthLayout } from "./AuthLayout";
import { AuthHeroSection } from "./AuthHeroSection";
import { ASSETS } from "@/lib/assets";

interface AuthContainerProps {
  children: React.ReactNode;
  badge?: string;
  title?: string;
  subtitle?: string;
  tagline?: string;
  footerMetric?: string;
  backgroundImage?: string;
  className?: string;
}

export function AuthContainer({
  children,
  badge,
  title,
  subtitle,
  tagline,
  footerMetric,
  backgroundImage: customBg,
  className,
}: AuthContainerProps) {
  const pathname = usePathname();

  // Determine dynamic background image based on active route
  const getBackgroundImage = () => {
    if (customBg) return customBg;
    if (
      pathname?.includes("/reset-password") ||
      pathname?.includes("/forgot-password")
    ) {
      return ASSETS.auth.resetPasswordBackground;
    }
    return ASSETS.auth.loginBackground;
  };

  const getHeroDefaults = () => {
    if (pathname?.includes("/forgot-password")) {
      return {
        badge: badge || "Account Recovery",
        title: title || "Secure Account & Identity Recovery",
        subtitle:
          subtitle ||
          "Verify your identity and receive a time-limited cryptographic token to safely restore your workspace access.",
        tagline: tagline || "Single-Use Cryptographic Reset Tokens",
        footerMetric: footerMetric || "Audit Logged Dispatch",
      };
    }

    if (pathname?.includes("/reset-password")) {
      return {
        badge: badge || "Credential Security",
        title: title || "Update Security Credentials",
        subtitle:
          subtitle ||
          "Ensure your account remains protected with strong password policies and immediate session token rotation.",
        tagline: tagline || "Zero-Knowledge Session Revocation",
        footerMetric: footerMetric || "AES-256 Key Exchange",
      };
    }

    return {
      badge: badge || "Identity & Access Control",
      title: title || "Enterprise Workforce & Access Management",
      subtitle:
        subtitle ||
        "High-velocity role-based authorization, dynamic permission evaluation, and verified on-duty field workforce operations.",
      tagline: tagline || "NIST Level 2 RBAC Floor & Ceiling Defense",
      footerMetric: footerMetric || "<0.4ms Redis Policy Check",
    };
  };

  const heroDefaults = getHeroDefaults();
  const backgroundImage = getBackgroundImage();

  return (
    <AuthLayout
      className={className}
      hero={
        <AuthHeroSection
          badge={heroDefaults.badge}
          title={heroDefaults.title}
          subtitle={heroDefaults.subtitle}
          tagline={heroDefaults.tagline}
          footerMetric={heroDefaults.footerMetric}
          backgroundImage={backgroundImage}
        />
      }
      content={children}
    />
  );
}

export default AuthContainer;
