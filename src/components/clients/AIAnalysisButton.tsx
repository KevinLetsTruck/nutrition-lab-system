"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AIAnalysisButtonProps {
  clientId: string;
  clientName: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function AIAnalysisButton({
  clientId,
  clientName,
  variant = "outline",
  size = "sm",
  className,
}: AIAnalysisButtonProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleAnalysis = async () => {
    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in to run AI analysis.",
      });
      return;
    }

    console.log("🚀 Starting AI analysis for client:", clientId);
    setIsAnalyzing(true);
    setAnalysisStatus("idle");

    try {
      console.log("📡 Making POST request to AI analysis endpoint...");
      const response = await fetch(`/api/clients/${clientId}/ai-analysis`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📊 Response status:", response.status, response.statusText);

      if (!response.ok) {
        console.log("❌ Response not OK, getting error details...");
        // Try to parse error as JSON, fallback to text
        let errorMessage = "AI analysis failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (data.success) {
        console.log("✅ Analysis successful, preparing to redirect...");
        setAnalysisStatus("success");
        toast.success("AI Analysis Complete!", {
          description: (
            <div className="space-y-1">
              <p>
                <strong>Client:</strong> {clientName}
              </p>
              <p>
                <strong>Status:</strong> Analysis generated successfully
              </p>
              <p className="text-xs text-gray-500 mt-2">
                🧠 Click to view comprehensive functional medicine analysis
              </p>
            </div>
          ),
          duration: 6000,
        });

        // Optional: Show system notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("FNTP AI Analysis Complete", {
            body: `${clientName} - Functional medicine analysis ready`,
            icon: "/favicon.ico",
          });
        }

        // Navigate to analysis results page
        setTimeout(() => {
          router.push(`/dashboard/clients/${clientId}/ai-analysis`);
        }, 1000);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error) {
      console.error("AI Analysis error:", error);
      setAnalysisStatus("error");
      
      // More detailed error handling
      let errorMessage = "An unexpected error occurred during analysis.";
      let errorDescription = "";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Specific error cases
        if (error.message.includes("Claude API key not configured")) {
          errorDescription = "Please configure ANTHROPIC_API_KEY in Railway environment variables.";
        } else if (error.message.includes("Claude API error: 401")) {
          errorDescription = "Invalid or expired Claude API key. Please check your API key.";
        } else if (error.message.includes("Claude API error: 429")) {
          errorDescription = "Rate limit exceeded. Please try again in a few minutes.";
        } else if (error.message.includes("Claude API error")) {
          errorDescription = "Claude AI service error. Please try again.";
        }
      }
      
      toast.error("AI Analysis Failed", {
        description: errorDescription || errorMessage,
        duration: 8000, // Longer duration for error messages
      });
    } finally {
      setIsAnalyzing(false);

      // Reset status after a delay
      setTimeout(() => {
        setAnalysisStatus("idle");
      }, 3000);
    }
  };

  const getButtonIcon = () => {
    if (isAnalyzing) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (analysisStatus === "success")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (analysisStatus === "error")
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Brain className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isAnalyzing) return "Analyzing...";
    if (analysisStatus === "success") return "Analysis Complete!";
    if (analysisStatus === "error") return "Analysis Failed";
    return "Get AI Analysis";
  };

  const getButtonVariant = () => {
    if (analysisStatus === "success") return "default";
    if (analysisStatus === "error") return "destructive";
    return variant;
  };

  return (
    <Button
      onClick={handleAnalysis}
      disabled={isAnalyzing}
      variant={getButtonVariant()}
      size={size}
      className={`gap-2 ${className || ""}`}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}
