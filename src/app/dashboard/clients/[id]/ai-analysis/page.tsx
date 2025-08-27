"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AIAnalysisDisplay } from "@/components/analysis/AIAnalysisDisplay";
import {
  ArrowLeft,
  Brain,
  RefreshCw,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  aiAnalysisResults?: string;
  aiAnalysisDate?: string;
  aiAnalysisVersion?: string;
}

export default function AIAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = params.id as string;

  useEffect(() => {
    console.log("🔍 AI Analysis page mounted. ClientId:", clientId, "Token present:", !!token);
    if (clientId && token) {
      console.log("📥 Fetching client data for analysis page...");
      fetchClientData();
    }
  }, [clientId, token]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}/complete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch client data");
      }

      const data = await response.json();
      console.log("📦 Client data received:", {
        hasClient: !!data.client,
        clientName: data.client ? `${data.client.firstName} ${data.client.lastName}` : 'N/A',
        hasAiAnalysisResults: !!data.client?.aiAnalysisResults,
        analysisResultsLength: data.client?.aiAnalysisResults?.length || 0,
        analysisDate: data.client?.aiAnalysisDate
      });
      
      setClient(data.client);

      // No need to check analysis status here - the client data already includes AI results
    } catch (error) {
      console.error("Error fetching client data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load client data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Removed checkAnalysisStatus function to prevent recursive loops
  // The client data from /api/clients/${clientId}/complete already includes AI analysis results

  const triggerNewAnalysis = async () => {
    if (!token || !client) return;

    setAnalyzing(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/ai-analysis`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("AI Analysis Updated!", {
          description: "Fresh analysis generated successfully",
        });

        // Refresh the client data to get the new analysis
        await fetchClientData();
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate analysis",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const goBackToClient = () => {
    router.push(`/dashboard/clients/${clientId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Loading Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Retrieving client data and AI analysis results...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Error Loading Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Client not found"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchClientData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={goBackToClient} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Client
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No analysis available
  if (!client.aiAnalysisResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={goBackToClient}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Client
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                AI Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {client.firstName} {client.lastName}
              </p>
            </div>
            <div></div> {/* Spacer */}
          </div>

          {/* No Analysis State */}
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  No AI Analysis Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Generate a comprehensive functional medicine analysis for{" "}
                  {client.firstName} {client.lastName} using AI. This will
                  analyze their health goals, notes, and documents to provide
                  insights.
                </p>

                <Button
                  onClick={triggerNewAnalysis}
                  disabled={analyzing}
                  className="gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Generate AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Analysis available - display results
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={goBackToClient}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Client
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Analysis Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {client.firstName} {client.lastName}
            </p>
          </div>

          <Button
            onClick={triggerNewAnalysis}
            disabled={analyzing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Update Analysis
              </>
            )}
          </Button>
        </div>

        {/* Analysis Display */}
        <AIAnalysisDisplay
          analysis={client.aiAnalysisResults}
          analysisDate={new Date(client.aiAnalysisDate || Date.now())}
          clientName={`${client.firstName} ${client.lastName}`}
          cached={!!client.aiAnalysisDate}
        />
      </div>
    </div>
  );
}
