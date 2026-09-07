import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CloudSyncBanner } from "@/components/providers/cloud-sync";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Vetra — Executive Search Dossier Engine",
  description:
    "Turn candidate interviews, CVs and search mandates into firm-specific, source-grounded executive dossiers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={clerkAppearance}
        >
          <AuthProvider>
            <AppShell>
              <CloudSyncBanner />
              {children}
            </AppShell>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
