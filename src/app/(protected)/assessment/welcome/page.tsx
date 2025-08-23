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
    router.push("/assessment");
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center px-6 py-2 bg-brand-green/20 text-brand-green rounded-xl text-sm font-medium border border-brand-green/30">
          Personalized Nutrition & Wellness
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          <span className="text-brand-green">Transform Your Life</span>{" "}
          <span className="text-brand-orange">Through</span>
          <br />
          <span className="text-white">Holistic Health Coaching</span>
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
  );
}
