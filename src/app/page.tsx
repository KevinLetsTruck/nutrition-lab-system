"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, FileText } from "lucide-react";
import { MainNav } from "@/components/navigation/MainNav";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // No automatic redirects - let user navigate manually

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-navy">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Navigation */}
      <MainNav />

      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-2 bg-brand-green/20 text-brand-green rounded-full text-sm font-medium">
              Daily Practice Management
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-brand-green via-green-400 to-brand-orange bg-clip-text text-transparent">
                Streamline Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-100 via-white to-gray-100 bg-clip-text text-transparent">
                Nutrition Practice
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Manage your nutrition practice efficiently with client tracking,
              appointment scheduling, and note management in one simple platform
            </p>

            {/* CTA Button */}
            <div className="pt-8">
              <Link href="/dashboard/clients">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-brand-green text-brand-darkNavy hover:bg-brand-green/90"
                >
                  Access Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-400 mt-3">
                Start managing your practice today
              </p>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-navy/50 to-transparent"></div>
      </div>

      {/* Features Section - Optional */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 hover:border-brand-green/50 transition-colors">
            <div className="w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-brand-green" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Client Management
            </h3>
            <p className="text-gray-400">
              Keep detailed records of your clients, their health goals, and
              contact information in an organized dashboard
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 hover:border-brand-green/50 transition-colors">
            <div className="w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-brand-green" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Appointment Scheduling
            </h3>
            <p className="text-gray-400">
              Schedule and track client appointments, Thursday calls, and
              follow-ups with an intuitive calendar system
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 hover:border-brand-green/50 transition-colors">
            <div className="w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-brand-green" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Session Notes
            </h3>
            <p className="text-gray-400">
              Document client sessions, progress notes, and recommendations for
              comprehensive care tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
