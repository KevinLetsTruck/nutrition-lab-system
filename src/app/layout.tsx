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
  title: "DestinationHealth - Transform Your Life Through Holistic Health Coaching",
  description: "Start your journey to optimal health with evidence-based nutritional guidance and personalized wellness strategies designed just for you.",
  keywords: ["health coaching", "nutrition", "wellness", "truck driver health", "functional medicine", "FNTP", "holistic health"],
  authors: [{ name: "DestinationHealth" }],
  creator: "DestinationHealth",
  publisher: "DestinationHealth",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://destinationhealth.com'),
  openGraph: {
    title: "DestinationHealth - Transform Your Life Through Holistic Health Coaching",
    description: "Start your journey to optimal health with evidence-based nutritional guidance and personalized wellness strategies designed just for you.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DestinationHealth - Transform Your Life Through Holistic Health Coaching",
    description: "Start your journey to optimal health with evidence-based nutritional guidance and personalized wellness strategies designed just for you.",
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
