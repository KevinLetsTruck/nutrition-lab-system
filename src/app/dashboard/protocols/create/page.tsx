"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FlaskConical, Plus, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ClientSelector } from "@/components/protocols/ClientSelector";
import { ProtocolBuilder } from "@/components/protocols/ProtocolBuilder";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
}

interface ClientAnalysis {
  id: string;
  analysisDate: string;
  fullAnalysis: string;
  executiveSummary?: string;
  systemAnalysis?: any;
  rootCauseAnalysis?: string;
  protocolRecommendations?: any;
}

export default function CreateProtocolPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientAnalyses, setClientAnalyses] = useState<ClientAnalysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"client" | "builder">("client");

  // Get initial client ID from URL params (for direct linking)
  const initialClientId = searchParams.get("clientId");
  const fromAnalysisId = searchParams.get("analysisId");

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  useEffect(() => {
    if (fromAnalysisId) {
      setSelectedAnalysisId(fromAnalysisId);
      setStep("builder");
    }
  }, [fromAnalysisId]);

  // Fetch client analyses when client is selected
  useEffect(() => {
    const fetchClientAnalyses = async () => {
      if (!selectedClient) {
        setClientAnalyses([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/clients/${selectedClient.id}/analysis/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setClientAnalyses(data.analyses || []);
        }
      } catch (error) {
        console.error("Failed to fetch client analyses:", error);
      }
    };

    fetchClientAnalyses();
  }, [selectedClient]);

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    setSelectedAnalysisId(undefined);
    if (client) {
      setStep("builder");
    } else {
      setStep("client");
    }
  };

  const handleProtocolCreated = (protocolId: string) => {
    toast.success("Protocol created successfully!");
    router.push(`/dashboard/protocols/${protocolId}`);
  };

  const breadcrumbItems = [
    {
      label: "Protocols",
      href: "/dashboard/protocols",
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      label: "Create Protocol",
      icon: <Plus className="h-4 w-4" />,
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen p-4" style={{ background: "var(--background)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Breadcrumb items={breadcrumbItems} className="mb-2" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create New Protocol
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {step === "client" 
                ? "Select a client to create a personalized protocol"
                : `Create protocol for ${selectedClient?.firstName} ${selectedClient?.lastName}`
              }
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/protocols">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Protocols
            </Link>
          </Button>
        </div>

        {/* Content */}
        {step === "client" ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Select Client
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose the client you want to create a protocol for. Clients with existing analyses will be prioritized.
              </p>
              
              <ClientSelector
                selectedClientId={initialClientId || undefined}
                onSelectClient={handleClientSelect}
                showAnalysisOnly={false}
                className="mb-6"
              />

              {selectedClient && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Protocol Creation Options
                      </h3>
                      {clientAnalyses.length > 0 ? (
                        <div>
                          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                            This client has {clientAnalyses.length} analysis{clientAnalyses.length > 1 ? "es" : ""} available. 
                            You can create a protocol from scratch or base it on an existing analysis.
                          </p>
                          <div className="space-y-2">
                            {clientAnalyses.slice(0, 3).map((analysis) => (
                              <div
                                key={analysis.id}
                                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Analysis from {new Date(analysis.analysisDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {analysis.executiveSummary ? 
                                      analysis.executiveSummary.substring(0, 80) + "..." :
                                      "Click to use this analysis"
                                    }
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAnalysisId(analysis.id);
                                    setStep("builder");
                                  }}
                                >
                                  Use This Analysis
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          No analyses found for this client. You can create a protocol from scratch 
                          or import a Claude analysis first.
                        </p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => setStep("builder")}
                          size="sm"
                        >
                          Create from Scratch
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/clients/${selectedClient.id}/analysis/import`}>
                            Import Analysis First
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Protocol Builder
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create a personalized protocol for {selectedClient?.firstName} {selectedClient?.lastName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setStep("client")}
                >
                  Change Client
                </Button>
              </div>
            </div>
            <div className="p-6">
              {selectedClient && (
                <ProtocolBuilder
                  clientId={selectedClient.id}
                  analysisId={selectedAnalysisId}
                  onProtocolCreated={handleProtocolCreated}
                  autoSave={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
