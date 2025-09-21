import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FNTP Nutrition System",
  description:
    "Comprehensive Nutritional Therapy Practice Management for Truck Drivers",
};

import { AuthProvider } from "@/lib/auth-context";
import { Toaster as Sonner } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DevToolbar } from "@/components/DevToolbar";
import { QuickScreenshot } from "@/components/QuickScreenshot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <ErrorBoundary>
            {children}
            <DevToolbar />
            <QuickScreenshot />
          </ErrorBoundary>
          <Sonner
            position="bottom-left"
            toastOptions={{
              classNames: {
                toast: "bg-gray-800 text-white border-gray-700",
                success: "bg-green-800 text-white border-green-700",
                error: "bg-red-800 text-white border-red-700",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
