'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Truck,
  Brain,
  Heart
} from 'lucide-react';
// import { AIConversationEngine, ValidationSummary } from '@/lib/ai-conversation-engine';

interface ValidationSummary {
  section: string;
  symptoms: Array<{
    name: string;
    severity: number;
    duration?: string;
    frequency?: string;
  }>;
  patterns: string[];
  truckDriverFactors: string[];
  confidence: number;
}

interface SectionValidationProps {
  conversationId: string;
  section: string;
  onClose: () => void;
  onValidate: (validated: boolean) => void;
}

export function SectionValidation({
  conversationId,
  section,
  onClose,
  onValidate
}: SectionValidationProps) {
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSymptoms, setExpandedSymptoms] = useState(true);
  const [expandedPatterns, setExpandedPatterns] = useState(true);
  const [userEdits, setUserEdits] = useState<Record<string, any>>({});

  const loadValidation = useCallback(async () => {
    try {
      const response = await fetch('/api/ai-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'validate', 
          conversationId, 
          section 
        })
      });
      
      if (!response.ok) throw new Error('Failed to load validation');
      
      const validationData = await response.json();
      setValidation(validationData);
    } catch (error) {
      console.error('Failed to load validation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, section]);

  useEffect(() => {
    loadValidation();
  }, [conversationId, section, loadValidation]);

  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return 'text-red-600 bg-red-50';
    if (severity >= 4) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 7) return 'Severe';
    if (severity >= 4) return 'Moderate';
    return 'Mild';
  };

  const getSectionIcon = () => {
    switch (section) {
      case 'digestive':
        return '🍽️';
      case 'neurological':
        return '🧠';
      case 'cardiovascular':
        return '❤️';
      case 'musculoskeletal':
        return '💪';
      case 'mental_emotional':
        return '🧘';
      default:
        return '📋';
    }
  };

  const handleConfirm = () => {
    // Here you would save any user edits back to the database
    onValidate(true);
  };

  const handleRequestChanges = () => {
    // Allow user to go back and modify their responses
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </Card>
      </div>
    );
  }

  if (!validation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getSectionIcon()}</span>
              <div>
                <h2 className="text-xl font-semibold">
                  {section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' ')} Health Summary
                </h2>
                <p className="text-sm text-foreground-secondary mt-1">
                  Please review and confirm the information we&apos;ve gathered
                </p>
              </div>
            </div>
            <Badge variant="default" className="ml-4">
              {Math.round(validation.confidence * 100)}% Complete
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Symptoms Summary */}
          <div>
            <button
              onClick={() => setExpandedSymptoms(!expandedSymptoms)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Symptoms Identified ({validation.symptoms.length})
              </h3>
              {expandedSymptoms ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSymptoms && (
              <div className="mt-4 space-y-3">
                {validation.symptoms.map((symptom, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{symptom.name}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className={`px-2 py-1 rounded ${getSeverityColor(symptom.severity)}`}>
                            {getSeverityLabel(symptom.severity)} ({symptom.severity}/10)
                          </span>
                          {symptom.duration && (
                            <span className="text-foreground-secondary">Duration: {symptom.duration}</span>
                          )}
                          {symptom.frequency && (
                            <span className="text-foreground-secondary">Frequency: {symptom.frequency}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patterns Detected */}
          {validation.patterns.length > 0 && (
            <div>
              <button
                onClick={() => setExpandedPatterns(!expandedPatterns)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Patterns Detected ({validation.patterns.length})
                </h3>
                {expandedPatterns ? <ChevronUp /> : <ChevronDown />}
              </button>
              
              {expandedPatterns && (
                <div className="mt-4 space-y-2">
                  {validation.patterns.map((pattern, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <p className="text-foreground-secondary">{pattern}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Truck Driver Factors */}
          {validation.truckDriverFactors.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <Truck className="h-5 w-5 text-blue-600" />
                Truck Driver Specific Factors
              </h3>
              <div className="space-y-2">
                {validation.truckDriverFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <p className="text-foreground-secondary">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {validation.symptoms.some(s => s.severity >= 8) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Important Note</h4>
                  <p className="text-sm text-red-800 mt-1">
                    Some symptoms reported are severe. While we&apos;ll address these in your protocol,
                    please consult with a healthcare provider if symptoms worsen or if you have
                    immediate concerns.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50">
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-4 border">
              <p className="text-center text-foreground-secondary font-medium">
                Does this summary accurately reflect what we discussed?
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleConfirm}
                className="min-w-[150px]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Yes, looks good
              </Button>
              <Button
                variant="outline"
                onClick={handleRequestChanges}
                className="min-w-[150px]"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Need to clarify
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}