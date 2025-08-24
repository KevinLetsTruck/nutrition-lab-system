"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AssessmentWelcomePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Check if user has existing assessment
  useEffect(() => {
    const checkExistingAssessment = async () => {
      if (!user?.clientId) return;

      try {
        const response = await fetch(
          `/api/assessment/client/${user.clientId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.assessment && data.assessment.questionsAsked > 0) {
            // User has already started assessment, skip welcome
            router.push("/assessment");
          }
        }
      } catch (error) {
        console.error("Error checking assessment:", error);
      }
    };

    checkExistingAssessment();
  }, [user, router]);

  const handleStartAssessment = () => {
    router.push("/assessment/intake");
  };

  return (
    <div className="min-h-screen bg-brand-navy relative">
      {/* Header with Logos */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <span className="font-semibold text-xl gradient-text">
          DestinationHealth
        </span>

        {/* MetabolX Logo - Center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            {/* MetabolX Icon */}
            <div className="relative w-10 h-10 mb-1">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="metabolx-gradient-welcome" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                {/* X shape with gradient - modern stylized design */}
                <g>
                  {/* Top-left to bottom-right diagonal */}
                  <rect x="15" y="25" width="70" height="15" rx="7.5" 
                        transform="rotate(45 50 50)" 
                        fill="url(#metabolx-gradient-welcome)" />
                  {/* Top-right to bottom-left diagonal */}
                  <rect x="15" y="25" width="70" height="15" rx="7.5" 
                        transform="rotate(-45 50 50)" 
                        fill="url(#metabolx-gradient-welcome)" />
                </g>
              </svg>
            </div>
            {/* MetabolX Text */}
            <div className="text-center">
              <div className="font-bold text-white text-xs">MetabolX</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Assessment</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-2 bg-brand-green/20 text-brand-green rounded-xl text-sm font-medium border border-brand-green/30">
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
            Start your journey to optimal health with evidence-based nutritional
            guidance and personalized wellness strategies designed just for you
          </p>

          {/* CTA Button */}
          <div className="pt-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={handleStartAssessment}
            >
              Begin Your Health Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
