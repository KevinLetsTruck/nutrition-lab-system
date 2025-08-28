"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Download,
  Clock,
  TrendingUp,
  Target,
  Brain,
  Stethoscope,
  FileText,
  Activity,
} from "lucide-react";

type TimelineType =
  | "COMPREHENSIVE"
  | "FOCUSED"
  | "SYMPTOMS"
  | "TREATMENTS"
  | "ASSESSMENTS"
  | "PROTOCOL_DEVELOPMENT";

interface TimelineExportDialogProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTimelineType?: TimelineType;
}

const timelineTypeOptions = [
  {
    value: "PROTOCOL_DEVELOPMENT" as TimelineType,
    label: "Protocol Development",
    description: "Optimized for Claude Desktop protocol generation",
    icon: Target,
  },
  {
    value: "COMPREHENSIVE" as TimelineType,
    label: "Comprehensive Timeline",
    description: "Complete health journey with all data points",
    icon: Activity,
  },
  {
    value: "FOCUSED" as TimelineType,
    label: "Focused Analysis",
    description: "Key events and critical findings only",
    icon: TrendingUp,
  },
  {
    value: "SYMPTOMS" as TimelineType,
    label: "Symptom Progression",
    description: "Symptom patterns and evolution",
    icon: Stethoscope,
  },
  {
    value: "TREATMENTS" as TimelineType,
    label: "Treatment History",
    description: "Protocols and interventions",
    icon: FileText,
  },
  {
    value: "ASSESSMENTS" as TimelineType,
    label: "Assessment Results",
    description: "Health assessments and analyses",
    icon: Brain,
  },
];

export function TimelineExportDialog({
  clientId,
  clientName,
  isOpen,
  onOpenChange,
  defaultTimelineType = "PROTOCOL_DEVELOPMENT",
}: TimelineExportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [timelineType, setTimelineType] =
    useState<TimelineType>(defaultTimelineType);

  // Granular control options - matching our schema
  const [includeAssessments, setIncludeAssessments] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeMedicalDocuments, setIncludeMedicalDocuments] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeProtocols, setIncludeProtocols] = useState(true);
  const [includeStatusChanges, setIncludeStatusChanges] = useState(true);
  const [includeAIAnalyses, setIncludeAIAnalyses] = useState(true);

  // Date range options
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const selectedOption = timelineTypeOptions.find(
    (option) => option.value === timelineType
  );
  const IconComponent = selectedOption?.icon || Target;

  const handleExport = async () => {
    try {
      setLoading(true);

      const requestBody = {
        timelineType,
        format: "markdown" as const,
        includeMetadata: true,

        // Granular control options
        includeAssessments,
        includeDocuments,
        includeMedicalDocuments,
        includeNotes,
        includeProtocols,
        includeStatusChanges,
        includeAIAnalyses,

        // Date range (if specified)
        ...(startDate || endDate
          ? {
              dateRange: {
                ...(startDate && { startDate: startDate.toISOString() }),
                ...(endDate && { endDate: endDate.toISOString() }),
              },
            }
          : {}),
      };

      const response = await fetch(`/api/clients/${clientId}/timeline-export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Export failed");
      }

      const data = await response.json();

      // Download the generated markdown file
      const blob = new Blob([data.markdownContent || data.content], {
        type: "text/markdown",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        data.fileName ||
        `${clientName}-timeline-${timelineType.toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${selectedOption?.label} timeline exported successfully`);
      onOpenChange(false);
    } catch (error) {
      console.error("Timeline export error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export timeline"
      );
    } finally {
      setLoading(false);
    }
  };

  const getDataSourceCount = () => {
    let count = 0;
    if (includeAssessments) count++;
    if (includeDocuments) count++;
    if (includeMedicalDocuments) count++;
    if (includeNotes) count++;
    if (includeProtocols) count++;
    if (includeStatusChanges) count++;
    if (includeAIAnalyses) count++;
    return count;
  };

  const isProtocolDevelopment = timelineType === "PROTOCOL_DEVELOPMENT";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <IconComponent className="h-5 w-5" />
            Timeline Export - {clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timeline Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Timeline Type
            </label>
            <Select
              value={timelineType}
              onValueChange={(value: TimelineType) => setTimelineType(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timelineTypeOptions.map((option) => {
                  const OptionIcon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <OptionIcon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Protocol Development Info */}
          {isProtocolDevelopment && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Claude Desktop Protocol Development
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Generates comprehensive timeline optimized for AI-assisted
                    protocol development with critical findings analysis,
                    progress trends, and protocol templates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Source Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Include Data Sources
              </label>
              <span className="text-xs text-gray-500">
                {getDataSourceCount()} of 7 selected
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="assessments"
                  checked={includeAssessments}
                  onCheckedChange={setIncludeAssessments}
                />
                <label
                  htmlFor="assessments"
                  className="text-sm text-gray-900 dark:text-gray-100 flex-1"
                >
                  <span className="font-medium">Assessment History</span>
                  <span className="block text-xs text-gray-500">
                    Health assessments, scores, and responses
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="medicalDocs"
                  checked={includeMedicalDocuments}
                  onCheckedChange={setIncludeMedicalDocuments}
                />
                <label
                  htmlFor="medicalDocs"
                  className="text-sm text-gray-900 dark:text-gray-100 flex-1"
                >
                  <span className="font-medium">
                    Lab Results & Medical Documents
                  </span>
                  <span className="block text-xs text-gray-500">
                    Lab values, medical reports, and biomarkers
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="protocols"
                  checked={includeProtocols}
                  onCheckedChange={setIncludeProtocols}
                />
                <label
                  htmlFor="protocols"
                  className="text-sm text-gray-900 dark:text-gray-100 flex-1"
                >
                  <span className="font-medium">Protocol History</span>
                  <span className="block text-xs text-gray-500">
                    Treatment protocols, supplements, and outcomes
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="notes"
                  checked={includeNotes}
                  onCheckedChange={setIncludeNotes}
                />
                <label
                  htmlFor="notes"
                  className="text-sm text-gray-900 dark:text-gray-100 flex-1"
                >
                  <span className="font-medium">Clinical Notes</span>
                  <span className="block text-xs text-gray-500">
                    Session notes, observations, and coaching calls
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="documents"
                  checked={includeDocuments}
                  onCheckedChange={setIncludeDocuments}
                />
                <label
                  htmlFor="documents"
                  className="text-sm text-gray-900 dark:text-gray-100 flex-1"
                >
                  <span className="font-medium">Document Uploads</span>
                  <span className="block text-xs text-gray-500">
                    General document uploads and files
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="statusChanges"
                  checked={includeStatusChanges}
                  onCheckedChange={setIncludeStatusChanges}
                />
                <label
                  htmlFor="statusChanges"
                  className="text-sm text-gray-900 dark:text-gray-100 flex-1"
                >
                  <span className="font-medium">Status Progression</span>
                  <span className="block text-xs text-gray-500">
                    Client status changes and milestones
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="aiAnalyses"
                  checked={includeAIAnalyses}
                  onCheckedChange={setIncludeAIAnalyses}
                />
                <label
                  htmlFor="aiAnalyses"
                  className="text-sm text-gray-900 dark:text-gray-100 flex-1"
                >
                  <span className="font-medium">AI Analysis Results</span>
                  <span className="block text-xs text-gray-500">
                    Previous AI health analyses and insights
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Date Range (Optional)
            </label>
            <p className="text-xs text-gray-500">
              Filter timeline events by date range. Leave empty to include all
              available data.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-700 dark:text-gray-300 mb-1 block">
                  Start Date
                </label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
              <div>
                <label className="text-xs text-gray-700 dark:text-gray-300 mb-1 block">
                  End Date
                </label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading || getDataSourceCount() === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Timeline
                </>
              )}
            </Button>
          </div>

          {getDataSourceCount() === 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center">
              Please select at least one data source to include in the timeline.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

