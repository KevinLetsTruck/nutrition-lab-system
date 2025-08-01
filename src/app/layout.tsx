import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: "DestinationHealth - Professional Health Coaching Platform",
  description: "Transform your health with evidence-based nutritional guidance and personalized wellness strategies designed for truck drivers and health-conscious individuals.",
  keywords: ["health coaching", "nutrition", "functional medicine", "truck driver health", "wellness", "FNTP"],
  authors: [{ name: "Kevin Rutherford, FNTP" }],
  creator: "Kevin Rutherford, FNTP",
  publisher: "DestinationHealth",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://destinationhealth.com'),
  openGraph: {
    title: "DestinationHealth - Professional Health Coaching Platform",
    description: "Transform your health with evidence-based nutritional guidance and personalized wellness strategies.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DestinationHealth - Professional Health Coaching Platform",
    description: "Transform your health with evidence-based nutritional guidance and personalized wellness strategies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right" 
              richColors 
              theme="dark"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}