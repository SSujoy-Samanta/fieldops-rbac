"use client";

import React, { useState } from "react";
import { authApi, getOAuthRedirectUri, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OAuthButtonsProps {
  /** The destination path to redirect to after successful authentication (e.g. /overview, /visits) */
  returnTo?: string;
  className?: string;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden className={cn("size-5 md:size-6 shrink-0", className)}>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export function OAuthButtons({ returnTo = "/overview", className }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Persist intended return destination for post-OAuth redirect
      if (typeof window !== "undefined") {
        const sanitizedReturnTo =
          returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
            ? returnTo
            : "/overview";
        sessionStorage.setItem("fieldops_return_to", sanitizedReturnTo);
      }

      // 2. Request Google OAuth authorization URL with CSRF state and explicit redirectUri
      const redirectUri = getOAuthRedirectUri();
      const res = await authApi.getOAuthState(redirectUri);
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        throw new Error("Failed to retrieve Google authorization URL");
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to initialize Google login");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="relative flex h-11 md:h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-blue-500/40 hover:border-blue-500 bg-background/60 hover:bg-blue-500/[0.04] px-4 text-sm md:text-base font-semibold text-foreground shadow-xs active:scale-[0.99] transition-all duration-300 disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        ) : (
          <GoogleIcon />
        )}
        <span>Continue with Google</span>
      </button>
    </div>
  );
}

export default OAuthButtons;
