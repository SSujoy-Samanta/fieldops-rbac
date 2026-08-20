"use client";

import { NotFoundPage } from "@/components/ui/not-found-page";
import { Wordmark } from "@/components/brand/Wordmark";

export default function NotFoundPageRoute() {
  return (
    <NotFoundPage
      wordmark={<Wordmark size="md" />}
      title="Beyond the Horizon"
      description="The path you sought leads to uncharted territory. Let's navigate you back."
      primaryAction={{
        label: "Return to Safety",
        href: "/login",
      }}
      secondaryAction={{
        label: "Main Portal",
        href: "/",
      }}
      footerLabel="FieldOps Secure Access"
      statusUrl="https://status.fieldops.local"
      supportUrl="mailto:support@fieldops.local"
    />
  );
}
