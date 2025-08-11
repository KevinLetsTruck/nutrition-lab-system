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
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          minHeight: '100vh'
        }}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#374151',
                color: '#f3f4f6',
                border: '1px solid #4b5563'
              },
              success: {
                style: {
                  background: '#065f46',
                  color: '#ecfdf5',
                  border: '1px solid #059669'
                },
              },
              error: {
                style: {
                  background: '#7f1d1d',
                  color: '#fef2f2',
                  border: '1px solid #dc2626'
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
