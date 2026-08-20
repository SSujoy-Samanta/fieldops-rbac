"use client";

import { useEffect } from "react";
import { RefreshCcw, LogIn } from "lucide-react";
import { ErrorPage } from "@/components/ui/error-page";
import { Wordmark } from "@/components/brand/Wordmark";

export default function ErrorPageRoute({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FieldOps App Error]:", error);
  }, [error]);

  return (
    <ErrorPage
      wordmark={<Wordmark size="md" />}
      title="System Interruption"
      description="We encountered an unexpected glitch. Our engineers are already on the case."
      {...(error.message ? { errorMessage: error.message } : {})}
      {...(error.digest ? { digest: error.digest } : {})}
      primaryAction={{
        label: "Synchronize & Retry",
        icon: <RefreshCcw className="mr-2 h-4 w-4" />,
        onClick: reset,
      }}
      secondaryAction={{
        label: "Return to Access",
        icon: <LogIn className="mr-2 h-4 w-4" />,
        href: "/login",
      }}
      footerLabel="FieldOps Secure Access"
      statusUrl="https://status.fieldops.local"
      supportUrl="mailto:support@fieldops.local"
    />
  );
}
