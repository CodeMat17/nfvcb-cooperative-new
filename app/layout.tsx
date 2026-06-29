import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import PwaInstallBanner from "@/components/pwa-install-banner";
import OfflineDetector from "@/components/offline-detector";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
  preload: true,
});

export const metadata: Metadata = {
  title: "NFVCB Staff Cooperative Society",
  description: "Cooperative Contribution Management App for NFVCB Staff",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  openGraph: {
    title: "NFVCB Staff Cooperative Society",
    description: "Cooperative Contribution Management App for NFVCB Staff",
    images: [{ url: "/opengraph-image.jpg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NFVCB Coop",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning>
      <body className='min-h-full flex flex-col'>
        <ClerkProvider>
          <ConvexClientProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange>
              {children}
              <Toaster richColors position='top-right' />
              <PwaInstallBanner />
              <OfflineDetector />
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
