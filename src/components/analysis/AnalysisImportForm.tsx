"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  Brain,
  FileText,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface AnalysisImportFormProps {
  clientId: string;
  clientName: string;
  onSuccess?: (analysisId: string) => void;
}

interface ParsePreview {
  sectionsDetected: number;
  sections: string[];
  analysisLength: number;
  summary: string;
}

export function AnalysisImportForm({
  clientId,
  clientName,
  onSuccess,
}: AnalysisImportFormProps) {
  const { token } = useAuth();
  const [analysisText, setAnalysisText] = useState("");
  const [practitionerNotes, setPractitionerNotes] = useState("");
  const [analysisVersion, setAnalysisVersion] = useState("v1.0");
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<ParsePreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = (text: string): ParsePreview | null => {
    if (!text || text.length < 50) return null;

    const sections = [];
    let sectionsDetected = 0;

    // Check for common Claude analysis sections
    if (text.includes("Executive Summary") || text.includes("## Executive")) {
      sections.push("Executive Summary");
      sectionsDetected++;
    }
    if (text.includes("System Analysis") || text.includes("Pattern Analysis")) {
      sections.push("System Analysis");
      sectionsDetected++;
    }
    if (text.includes("Root Cause") || text.includes("## Root")) {
      sections.push("Root Cause Analysis");
      sectionsDetected++;
    }
    if (text.includes("Protocol") || text.includes("Recommendations")) {
      sections.push("Protocol Recommendations");
      sectionsDetected++;
    }
    if (text.includes("Monitoring") || text.includes("Follow-up")) {
      sections.push("Monitoring Plan");
      sectionsDetected++;
    }
    if (text.includes("Patient Education") || text.includes("Education")) {
      sections.push("Patient Education");
      sectionsDetected++;
    }

    return {
      sectionsDetected,
      sections,
      analysisLength: text.length,
      summary: `${sectionsDetected} sections detected in ${
        Math.round(text.length / 100) / 10
      }K characters`,
    };
  };

  const handleAnalysisChange = (value: string) => {
    setAnalysisText(value);
    setError(null);

    if (value.length > 100) {
      setPreview(generatePreview(value));
    } else {
      setPreview(null);
    }
  };

  const handleImport = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!analysisText.trim()) {
      setError("Analysis text is required");
      return;
    }

    if (analysisText.length < 100) {
      setError("Analysis text is too short (minimum 100 characters)");
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/analysis/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisText: analysisText.trim(),
          practitionerNotes: practitionerNotes.trim() || undefined,
          analysisVersion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import analysis");
      }

      const data = await response.json();

      toast.success("Claude analysis imported successfully!", {
        description: `${data.analysis.sectionsDetected} sections detected and parsed`,
      });

      // Reset form
      setAnalysisText("");
      setPractitionerNotes("");
      setPreview(null);

      // Call success callback
      if (onSuccess) {
        onSuccess(data.analysis.id);
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.message);
      toast.error("Failed to import analysis", {
        description: err.message,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Brain className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Import Claude Analysis
          </h1>
          <p className="text-gray-600">
            Import analysis for{" "}
            <span className="font-medium">{clientName}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analysis Content
          </CardTitle>
          <CardDescription>
            Paste the complete analysis from Claude Desktop below. The system
            will automatically detect and parse different sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label
              htmlFor="analysis-text"
              className="text-gray-900 font-medium"
            >
              Analysis Text *
            </Label>
            <Textarea
              id="analysis-text"
              placeholder="Paste Claude Desktop analysis here..."
              value={analysisText}
              onChange={(e) => handleAnalysisChange(e.target.value)}
              className="min-h-[300px] mt-2"
              disabled={isImporting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum 100 characters required • Current: {analysisText.length}
            </p>
          </div>

          {preview && (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{preview.summary}</span>
                  <div className="flex flex-wrap gap-1">
                    {preview.sections.map((section) => (
                      <Badge
                        key={section}
                        variant="secondary"
                        className="text-xs"
                      >
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version" className="text-gray-900 font-medium">
                Analysis Version
              </Label>
              <Input
                id="version"
                value={analysisVersion}
                onChange={(e) => setAnalysisVersion(e.target.value)}
                placeholder="v1.0"
                className="mt-2"
                disabled={isImporting}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="practitioner-notes"
              className="text-gray-900 font-medium"
            >
              Practitioner Notes
            </Label>
            <Textarea
              id="practitioner-notes"
              placeholder="Add your clinical observations, adjustments, or additional context..."
              value={practitionerNotes}
              onChange={(e) => setPractitionerNotes(e.target.value)}
              className="mt-2 min-h-[100px]"
              disabled={isImporting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional - your clinical observations and notes about this
              analysis
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleImport}
              disabled={
                !analysisText.trim() || isImporting || analysisText.length < 100
              }
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Import Analysis
                </>
              )}
            </Button>

            {preview && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="h-4 w-4" />
                Ready to import {preview.sectionsDetected} sections
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
