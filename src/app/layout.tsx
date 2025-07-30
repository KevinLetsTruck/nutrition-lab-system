import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FNTP Clinical - Professional Nutrition Practice Management",
  description: "Clinical workflow system for FNTP practitioners specializing in truck driver health and functional medicine protocols.",
  keywords: ["FNTP", "clinical", "nutrition", "truck driver health", "functional medicine", "protocols", "practice management"],
  authors: [{ name: "Kevin Rutherford, FNTP" }],
  creator: "Kevin Rutherford, FNTP",
  publisher: "FNTP Clinical",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fntp-clinical.com'),
  openGraph: {
    title: "FNTP Clinical - Professional Nutrition Practice Management",
    description: "Clinical workflow system for FNTP practitioners specializing in truck driver health and functional medicine protocols.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FNTP Clinical - Professional Nutrition Practice Management",
    description: "Clinical workflow system for FNTP practitioners specializing in truck driver health and functional medicine protocols.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
