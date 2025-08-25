"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AssessmentsPage() {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);

  const handleNewAssessment = async () => {
    setCreating(true);
    try {
      // Get or create a test client
      // In production, this would use the authenticated user's client
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: "test-client", // This will be replaced with actual client ID
          templateId: "default",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to the new assessment
        router.push(`/assessment/${data.assessment.id}`);
      } else {
        const error = await response.json();
        console.error("Failed to create assessment:", error);

        // Check if client already has an active assessment
        if (error.existingId) {
          if (
            confirm(
              "You already have an active assessment. Would you like to continue it?"
            )
          ) {
            router.push(`/assessment/${error.existingId}`);
          }
        } else {
          alert("Failed to create assessment. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      alert("Failed to create assessment. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Health Assessments
          </h1>
          <Button onClick={handleNewAssessment} disabled={creating}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {creating ? "Creating..." : "New Assessment"}
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Start a new assessment to analyze your health and receive
            personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
