"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Calendar,
  User,
  Printer,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AIAnalysisDisplayProps {
  analysis: string;
  analysisDate: Date;
  clientName: string;
  cached?: boolean;
}

export function AIAnalysisDisplay({
  analysis,
  analysisDate,
  clientName,
  cached = false,
}: AIAnalysisDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened", {
      description: "Analysis formatted for professional printing",
    });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(analysis);
      setIsCopied(true);
      toast.success("Analysis copied to clipboard", {
        description: "Full analysis text copied for sharing",
      });

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard", {
        description: "Please try selecting and copying manually",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Simple markdown-like formatting for analysis text
  const formatAnalysisText = (text: string) => {
    // Split into sections and format
    const sections = text.split(/(?=#{1,3}\s)/);

    return sections.map((section, index) => {
      if (!section.trim()) return null;

      // Handle headers
      if (section.startsWith("# ")) {
        const content = section.replace("# ", "").trim();
        return (
          <div key={index} className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b-2 border-blue-500 pb-2 mb-4">
              {content}
            </h1>
          </div>
        );
      }

      if (section.startsWith("## ")) {
        const content = section.replace("## ", "").trim();
        return (
          <div key={index} className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {content}
            </h2>
          </div>
        );
      }

      if (section.startsWith("### ")) {
        const content = section.replace("### ", "").trim();
        return (
          <div key={index} className="mb-3">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {content}
            </h3>
          </div>
        );
      }

      // Handle paragraphs and lists
      const lines = section.split("\n").filter((line) => line.trim());

      return (
        <div key={index} className="mb-4">
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim();

            if (!trimmedLine) return null;

            // Handle bullet points
            if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("• ")) {
              return (
                <div key={lineIndex} className="flex items-start mb-2 ml-4">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {trimmedLine.replace(/^[-•]\s*/, "")}
                  </p>
                </div>
              );
            }

            // Handle numbered lists
            if (trimmedLine.match(/^\d+\.\s/)) {
              return (
                <div key={lineIndex} className="flex items-start mb-2 ml-4">
                  <span className="text-green-600 font-semibold mr-2 mt-1">
                    {trimmedLine.match(/^\d+/)?.[0]}.
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {trimmedLine.replace(/^\d+\.\s*/, "")}
                  </p>
                </div>
              );
            }

            // Handle bold text **text**
            const boldFormatted = trimmedLine.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>'
            );

            // Regular paragraphs
            if (trimmedLine.length > 0) {
              return (
                <p
                  key={lineIndex}
                  className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3"
                  dangerouslySetInnerHTML={{ __html: boldFormatted }}
                />
              );
            }

            return null;
          })}
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Card */}
      <Card className="mb-6 print:shadow-none">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  AI Functional Medicine Analysis
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{clientName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(analysisDate)}</span>
                  </div>
                  {cached && (
                    <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span>Cached Result</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 print:hidden">
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {isCopied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {isCopied ? "Copied!" : "Copy"}
              </Button>

              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Content */}
      <Card className="print:shadow-none">
        <CardContent className="p-8">
          {/* Professional Analysis Display */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6">{formatAnalysisText(analysis)}</div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center print:block">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Brain className="w-4 h-4" />
              <span>Generated by FNTP AI Analysis System</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              This analysis is generated by AI and should be reviewed by a
              qualified healthcare professional. Not intended as medical advice.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:shadow-none {
            box-shadow: none !important;
          }

          @page {
            margin: 1in;
            size: letter;
          }

          .prose {
            font-size: 11pt;
            line-height: 1.4;
          }

          h1 {
            font-size: 16pt;
            page-break-after: avoid;
          }

          h2 {
            font-size: 14pt;
            page-break-after: avoid;
          }

          h3 {
            font-size: 12pt;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
