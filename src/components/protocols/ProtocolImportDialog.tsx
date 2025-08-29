'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Upload, FileText, Users, Loader2, Download, CheckCircle, X } from 'lucide-react';

interface ProtocolImportDialogProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProtocolImported?: () => void;
}

export function ProtocolImportDialog({
  clientId,
  clientName,
  isOpen,
  onOpenChange,
  onProtocolImported,
}: ProtocolImportDialogProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [protocolData, setProtocolData] = useState('');
  const [generateCoachingNotes, setGenerateCoachingNotes] = useState(true);
  const [generateClientLetter, setGenerateClientLetter] = useState(true);
  const [generateSupplementList, setGenerateSupplementList] = useState(true);
  interface ImportResults {
    protocolId: string;
    formattedOutputs: {
      coachingNotes?: string;
      clientLetter?: string;
      supplementList?: string;
    };
  }

  const [importResults, setImportResults] = useState<ImportResults | null>(null);

  const handleImport = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    if (!protocolData.trim()) {
      toast.error('Please paste the protocol data from Claude Desktop');
      return;
    }

    try {
      setLoading(true);

      // Try to parse the protocol data as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(protocolData);
      } catch (parseError) {
        toast.error('Invalid JSON format', {
          description: 'Please ensure the protocol data is in valid JSON format from Claude Desktop'
        });
        return;
      }

      console.log('🚀 Importing protocol data:', parsedData);

      const response = await fetch('/api/protocols/import', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId,
          protocolData: parsedData,
          formatOptions: {
            generateCoachingNotes,
            generateClientLetter,
            generateSupplementList,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Import failed:', errorData);
        throw new Error(errorData.error || 'Import failed');
      }

      const data = await response.json();
      setImportResults(data);
      
      toast.success('Protocol imported successfully!', {
        description: `Generated ${Object.keys(data.formattedOutputs || {}).length} formatted documents`
      });
      
      onProtocolImported?.();

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import protocol', {
        description: error instanceof Error ? error.message : 'Please check the JSON format and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFormatted = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${filename}`, {
      description: 'File saved to your Downloads folder'
    });
  };

  const resetDialog = () => {
    setImportResults(null);
    setProtocolData('');
    setGenerateCoachingNotes(true);
    setGenerateClientLetter(true);
    setGenerateSupplementList(true);
  };

  if (importResults) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Protocol Import Successful - {clientName}
            </DialogTitle>
            <DialogDescription>
              Your Claude Desktop protocol has been imported and formatted into professional documents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Protocol Successfully Imported!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Protocol ID: {importResults.protocolId}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Generated Documents
              </h4>
              
              {importResults.formattedOutputs?.coachingNotes && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Coaching Notes
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Structured summary for practitioner consultation
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => downloadFormatted(
                      importResults.formattedOutputs.coachingNotes,
                      `${clientName.replace(/\s+/g, '-')}-coaching-notes.md`
                    )}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}

              {importResults.formattedOutputs?.clientLetter && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Client Protocol Letter
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Professional instructions for client implementation
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => downloadFormatted(
                      importResults.formattedOutputs.clientLetter,
                      `${clientName.replace(/\s+/g, '-')}-protocol-letter.md`
                    )}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}

              {importResults.formattedOutputs?.supplementList && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Supplement List
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Organized recommendations with dosages and timing
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => downloadFormatted(
                      importResults.formattedOutputs.supplementList,
                      `${clientName.replace(/\s+/g, '-')}-supplements.md`
                    )}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetDialog();
                }}
                className="flex-1"
              >
                Import Another
              </Button>
              <Button
                onClick={() => {
                  resetDialog();
                  onOpenChange(false);
                }}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Upload className="h-5 w-5 text-blue-600" />
            Import Protocol from Claude Desktop
          </DialogTitle>
          <DialogDescription>
            Import structured protocol data from Claude Desktop analysis and generate professional practitioner and client documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  How to Import Claude Desktop Protocols
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  1. Get your protocol analysis from Claude Desktop<br/>
                  2. Copy the structured JSON protocol data<br/>
                  3. Paste it below and select which documents to generate<br/>
                  4. Download your professional formatted documents
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Protocol Data from Claude Desktop
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Client: {clientName}
              </span>
            </div>
            <Textarea
              value={protocolData}
              onChange={(e) => setProtocolData(e.target.value)}
              placeholder={`Paste the structured protocol JSON data from Claude Desktop here...

Example format:
{
  "analysisDate": "2024-01-28",
  "rootCauseAnalysis": "Analysis of root causes...",
  "systemPriorities": ["Digestive Health", "Energy Production"],
  "phase1Protocol": {
    "supplements": [
      {
        "name": "Digestive Enzymes",
        "dosage": "1 capsule",
        "timing": "with each meal",
        "duration": "4-6 weeks"
      }
    ],
    "dietaryChanges": ["Eliminate gluten", "Add bone broth"],
    "lifestyleModifications": ["10,000 steps daily"],
    "duration": "4-6 weeks"
  },
  "monitoringPlan": {
    "keyBiomarkers": ["CRP", "Vitamin D"],
    "retestingSchedule": "8-12 weeks",
    "progressIndicators": ["Improved energy"],
    "warningSignsToWatch": ["Severe digestive upset"]
  }
}`}
              rows={12}
              className="font-mono text-xs resize-y"
            />
            {protocolData && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ✅ Data entered ({protocolData.length} characters)
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generate Professional Documents
            </h4>
            
            <div className="space-y-3 pl-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="coaching"
                  checked={generateCoachingNotes}
                  onCheckedChange={(checked) => setGenerateCoachingNotes(checked as boolean)}
                />
                <div className="space-y-1">
                  <label htmlFor="coaching" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                    Coaching Notes
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Structured summary for practitioner use during client consultations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="client"
                  checked={generateClientLetter}
                  onCheckedChange={(checked) => setGenerateClientLetter(checked as boolean)}
                />
                <div className="space-y-1">
                  <label htmlFor="client" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                    Client Protocol Letter
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Professional instructions and explanations formatted for client delivery
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="supplements"
                  checked={generateSupplementList}
                  onCheckedChange={(checked) => setGenerateSupplementList(checked as boolean)}
                />
                <div className="space-y-1">
                  <label htmlFor="supplements" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                    Supplement List
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Organized supplement recommendations with dosages, timing, and tracking tools
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading || !protocolData.trim() || !token}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import & Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
