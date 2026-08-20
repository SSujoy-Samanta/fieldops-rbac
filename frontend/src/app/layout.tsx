import type { Metadata, Viewport } from "next";
import { Urbanist, Righteous } from "next/font/google";
import { Providers } from "@/providers/Providers";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FieldOps | Enterprise RBAC & Field Operations",
    template: "%s | FieldOps",
  },
  description:
    "Enterprise Role-Based Access Control and Field Operations platform for real-time attendance, customer visit management, and granular permission workflows.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  keywords: [
    "fieldops",
    "rbac",
    "access control",
    "field management",
    "attendance",
    "visits",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${urbanist.variable} ${righteous.variable}`}
    >
      <body
        className="font-sans antialiased min-h-screen bg-background text-foreground"
        style={{ fontFamily: "var(--font-urbanist), sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
