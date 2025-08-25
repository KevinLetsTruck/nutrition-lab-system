"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
              Personalized Nutrition & Wellness
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-brand-green via-green-400 to-brand-orange bg-clip-text text-transparent">
                Transform Your Life Through
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-100 via-white to-gray-100 bg-clip-text text-transparent">
                Holistic Health Coaching
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Start your journey to optimal health with evidence-based
              nutritional guidance and personalized wellness strategies designed
              just for you
            </p>

            {/* CTA Button */}
            <div className="pt-8">
              <Link href="/assessment/start">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-brand-green text-brand-darkNavy hover:bg-brand-green/90"
                >
                  Start Your Free Health Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-400 mt-3">
                No login required • Takes 15-20 minutes
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
              <svg
                className="w-6 h-6 text-brand-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Comprehensive Assessment
            </h3>
            <p className="text-gray-400">
              246 body-system focused questions to understand your unique health
              profile and nutritional needs
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 hover:border-brand-green/50 transition-colors">
            <div className="w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-brand-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Personalized Plans
            </h3>
            <p className="text-gray-400">
              Custom nutrition protocols based on your assessment results and
              health goals
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 hover:border-brand-green/50 transition-colors">
            <div className="w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-brand-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Track Progress
            </h3>
            <p className="text-gray-400">
              Monitor your health improvements with regular check-ins and
              adjustments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
