"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NAQResponseEntry from "@/components/medical/NAQResponseEntry";
import AssessmentResultsViewer from "@/components/medical/AssessmentResultsViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart, ArrowLeft } from "lucide-react";

export default function AssessmentEntryPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const [mode, setMode] = useState<"entry" | "results">("entry");
  const [documentInfo, setDocumentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentInfo();
  }, [documentId]);

  const fetchDocumentInfo = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      const data = await response.json();
      setDocumentInfo(data);
    } catch (error) {
      console.error("Error fetching document:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assessment Data Entry</h1>
            <p className="text-gray-600 mt-1">
              {documentInfo?.document?.originalFileName ||
                "Assessment Document"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={mode === "entry" ? "default" : "outline"}
              onClick={() => setMode("entry")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Data Entry
            </Button>
            <Button
              variant={mode === "results" ? "default" : "outline"}
              onClick={() => setMode("results")}
            >
              <BarChart className="h-4 w-4 mr-2" />
              View Results
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      {mode === "entry" && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>
                Click on the number (0-3) that the client circled for each
                question
              </li>
              <li>For yes/no questions: 0 = No, 1 = Yes</li>
              <li>Save each section before moving to the next</li>
              <li>Green dots indicate completed sections</li>
              <li>
                You can navigate between sections using the dots or navigation
                buttons
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {mode === "entry" ? (
        <NAQResponseEntry
          documentId={documentId}
          clientName={
            documentInfo?.document?.client?.firstName +
            " " +
            documentInfo?.document?.client?.lastName
          }
        />
      ) : (
        <AssessmentResultsViewer documentId={documentId} />
      )}
    </div>
  );
}
