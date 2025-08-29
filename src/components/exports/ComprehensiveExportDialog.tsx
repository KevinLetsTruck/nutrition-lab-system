'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Download,
  Package,
  FileText,
  Activity,
  Stethoscope,
  Pill,
} from 'lucide-react';

interface ComprehensiveExportDialogProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComprehensiveExportDialog({
  clientId,
  clientName,
  isOpen,
  onOpenChange,
}: ComprehensiveExportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [includeAssessments, setIncludeAssessments] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeLabResults, setIncludeLabResults] = useState(true);
  const [includeProtocols, setIncludeProtocols] = useState(true);
  const [includeClinicalNotes, setIncludeClinicalNotes] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);

  const handleExport = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/exports/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          clientId,
          includeAssessments,
          includeDocuments,
          includeLabResults,
          includeProtocols,
          includeClinicalNotes,
          includeTimeline,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Export failed' }));
        throw new Error(errorData.error || 'Export failed');
      }

      // Download ZIP file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName.replace(/\s+/g, '-')}-comprehensive-export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Comprehensive export downloaded successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate export';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isExportValid =
    includeTimeline ||
    includeAssessments ||
    includeDocuments ||
    includeLabResults ||
    includeProtocols ||
    includeClinicalNotes;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 font-medium">
            <Package className="h-5 w-5" />
            Comprehensive Export - {clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Claude Desktop Ready
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Export complete client package (structured analysis + raw
                  documents) optimized for Claude Desktop protocol development.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Package Contents</h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="timeline"
                  checked={includeTimeline}
                  onCheckedChange={checked =>
                    setIncludeTimeline(checked as boolean)
                  }
                />
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <label
                    htmlFor="timeline"
                    className="text-sm text-gray-900 font-medium"
                  >
                    Timeline Analysis
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-600 ml-9">
                Chronological health journey with all events
              </p>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="assessments"
                  checked={includeAssessments}
                  onCheckedChange={checked =>
                    setIncludeAssessments(checked as boolean)
                  }
                />
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-gray-600" />
                  <label
                    htmlFor="assessments"
                    className="text-sm text-gray-900 font-medium"
                  >
                    Assessment Analysis
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-600 ml-9">
                80-question functional medicine assessment results
              </p>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="documents"
                  checked={includeDocuments}
                  onCheckedChange={checked =>
                    setIncludeDocuments(checked as boolean)
                  }
                />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <label
                    htmlFor="documents"
                    className="text-sm text-gray-900 font-medium"
                  >
                    Raw Documents
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-600 ml-9">
                NutriQ reports, NAQ questionnaires, lab results, intake forms
              </p>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="protocols"
                  checked={includeProtocols}
                  onCheckedChange={checked =>
                    setIncludeProtocols(checked as boolean)
                  }
                />
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-gray-600" />
                  <label
                    htmlFor="protocols"
                    className="text-sm text-gray-900 font-medium"
                  >
                    Protocols & Recommendations
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-600 ml-9">
                Previous treatment protocols and supplement recommendations
              </p>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="notes"
                  checked={includeClinicalNotes}
                  onCheckedChange={checked =>
                    setIncludeClinicalNotes(checked as boolean)
                  }
                />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <label
                    htmlFor="notes"
                    className="text-sm text-gray-900 font-medium"
                  >
                    Clinical Notes
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-600 ml-9">
                Session notes, interview records, and observations
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              💡 <strong>Claude Desktop Usage:</strong> Upload the entire ZIP
              package to Claude Desktop and request comprehensive protocol
              development based on all included data sources.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
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
              disabled={loading || !isExportValid}
              className="flex-1"
            >
              {loading ? (
                'Generating ZIP...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Package
                </>
              )}
            </Button>
          </div>

          {!isExportValid && (
            <p className="text-xs text-red-600 text-center">
              Please select at least one content type to export
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
