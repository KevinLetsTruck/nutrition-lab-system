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
  title: "Nutrition Lab Management - AI-Powered Lab Analysis",
  description: "Upload and analyze your lab results with AI-powered insights. Get comprehensive health assessments in minutes.",
  keywords: ["nutrition", "lab analysis", "AI", "health", "biomarkers", "wellness", "functional medicine"],
  authors: [{ name: "Nutrition Lab System" }],
  creator: "Nutrition Lab System",
  publisher: "Nutrition Lab System",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nutrition-lab-system.vercel.app'),
  openGraph: {
    title: "Nutrition Lab Management - AI-Powered Lab Analysis",
    description: "Upload and analyze your lab results with AI-powered insights. Get comprehensive health assessments in minutes.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutrition Lab Management - AI-Powered Lab Analysis",
    description: "Upload and analyze your lab results with AI-powered insights. Get comprehensive health assessments in minutes.",
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
        {children}
      </body>
    </html>
  );
}
