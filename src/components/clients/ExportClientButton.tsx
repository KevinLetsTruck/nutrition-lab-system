"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ExportClientButtonProps {
  clientId: string;
  clientName: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export function ExportClientButton({
  clientId,
  clientName,
  variant = "outline",
  size = "sm",
}: ExportClientButtonProps) {
  const { token } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleExport = async () => {
    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in to export client data.",
      });
      return;
    }

    setIsExporting(true);
    setExportStatus("idle");

    try {
      // First, fetch supplement context for enhanced prompts
      const supplementContextResponse = await fetch(
        `/api/clients/${clientId}/supplement-context`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let supplementContext = null;
      if (supplementContextResponse.ok) {
        supplementContext = await supplementContextResponse.json();
      }

      const response = await fetch(
        `/api/clients/${clientId}/export-for-analysis`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }

      // Handle ZIP file download
      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `${clientName}-export.zip`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      if (true) {
        setExportStatus("success");
        toast.success("Export Downloaded!", {
          description: (
            <div className="space-y-1">
              <p>
                <strong>Client:</strong> {clientName}
              </p>
              <p>
                <strong>File:</strong> {filename}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                📦 ZIP file downloaded to your Downloads folder
              </p>
              <p className="text-xs text-blue-500 mt-1">
                💡 Extract the ZIP to get organized folder structure
              </p>
            </div>
          ),
          duration: 6000,
        });

        // Optional: Show system notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("FNTP Client Export Complete", {
            body: `${clientName} data exported successfully`,
            icon: "/favicon.ico",
          });
        }

        // Trigger Claude prompts modal
        const claudePromptsData = {
          filename: filename,
          location: "Downloads folder",
          supplementContext: supplementContext, // NEW: Include supplement context
          prompts: {
            comprehensive: `FNTP FUNCTIONAL MEDICINE ANALYSIS - EXECUTE IMMEDIATELY

CRITICAL INSTRUCTIONS: 
- DO NOT ask clarifying questions or request file uploads
- ZIP FILE IS READY: ${filename} in your Downloads folder
- EXTRACT and ANALYZE all contents directly
- PROCEED with complete analysis using all extracted files
- RETURN STRUCTURED JSON OUTPUT as specified below

SYSTEM ACTIVATION: You are my FNTP functional medicine analysis system. Load all protocols.

FILE LOCATION: Downloads/${filename}
- Extract the ZIP to access organized folder structure
- Contains: client-data.json (complete client information)
- Contains: client-summary.md (human-readable overview)
- Contains: export-metadata.json (system information)
- Contains: documents/ folder with all client PDF files

CLIENT OVERVIEW:
- Name: ${clientName}
- Export Date: ${new Date().toLocaleDateString()}
${supplementContext ? `
CURRENT SUPPLEMENT CONTEXT:
- Current Supplements: ${supplementContext.currentSupplements.count} (Monthly cost: $${supplementContext.currentSupplements.estimatedMonthlyCost})
- Current Medications: ${supplementContext.currentMedications.count}
- Allergies: ${supplementContext.healthContext.allergies.join(', ') || 'None reported'}
- Trucker Status: ${supplementContext.healthContext.isTruckDriver ? 'Yes' : 'No'}
- Risk Factors: ${supplementContext.riskFactors.medicationInteractions.join('; ') || 'None identified'}
` : ''}

LETSTRUCK PRIORITIZATION RULES (CRITICAL):
1. LyteBalance: Universal foundation for ALL clients (unless contraindicated)
2. Calocurb: GLP-1 support, appetite control, menopause support
3. Cardio Miracle: Cardiovascular, circulation, diabetes support
4. HIERARCHY: LetsTruck FIRST → Biotics Research SECOND → FullScript THIRD

ANALYSIS REQUIREMENTS:
1. EXTRACT the ZIP file: ${filename}
2. READ client-data.json for complete client information
3. REVIEW client-summary.md for clinical context
4. ANALYZE all PDF documents in documents/ folder
5. CHECK current medications for interactions
6. APPLY LetsTruck prioritization rules

MANDATORY STRUCTURED JSON OUTPUT:
Your response MUST include this exact JSON structure:

\`\`\`json
{
  "supplements": [
    {
      "name": "LyteBalance",
      "brand": "LetsTruck",
      "dosage": "1 packet",
      "timing": "Morning with 16oz water",
      "duration": "Ongoing",
      "priority": "CRITICAL",
      "category": "Foundational",
      "rationale": "Universal electrolyte foundation for truckers",
      "phase": "PHASE1",
      "estimatedCost": 45,
      "interactions": "None known",
      "contraindications": "None",
      "letstruck_sku": "LT-LYTE-30",
      "biotics_alternative": "Bio-Electrolyte Plus",
      "fullscript_backup": "Designs for Health Electrolyte Synergy"
    }
  ],
  "totalMonthlyCost": 150,
  "phaseTimeline": "Phase 1: 30 days foundation, Phase 2: 60 days targeted, Phase 3: 90 days optimization",
  "medicationWarnings": ["Check with prescribing physician before starting"],
  "priorityReasoning": "Foundation protocol prioritizes LetsTruck products for trucker-specific needs",
  "truckerSpecificNotes": ["All supplements selected for road compliance", "No refrigeration required", "Easy dosing schedule"]
}
\`\`\`

SAFETY REQUIREMENTS:
- Check ALL medication interactions first
- Include contraindication warnings
- Provide clinical rationale for each recommendation
- Cost analysis with alternatives
- Trucker-specific compliance considerations

EXTRACT ZIP FILE AND EXECUTE COMPREHENSIVE FNTP ANALYSIS WITH STRUCTURED JSON OUTPUT NOW.`,
            focused: {
              gut: `GUT HEALTH ANALYSIS - Extract and use ZIP file data

LETSTRUCK PRIORITIZATION FOR GUT HEALTH:
- LyteBalance: Foundation electrolyte support
- Consider Biotics Research probiotics if LetsTruck unavailable
- Apply structured JSON output format for supplement recommendations

${supplementContext ? `
CURRENT GUT-RELATED CONTEXT:
- Current Supplements: ${supplementContext.currentSupplements.list.filter((s: any) => 
  s.name.toLowerCase().includes('probiotic') || 
  s.name.toLowerCase().includes('digestive')
).length} digestive supplements
- Medication Interactions: ${supplementContext.riskFactors.medicationInteractions.join('; ') || 'None'}
` : ''}

RETURN STRUCTURED JSON OUTPUT WITH LETSTRUCK PRIORITIZATION.`,

              metabolic: `METABOLIC ANALYSIS - Extract and use ZIP file data

LETSTRUCK PRIORITIZATION FOR METABOLIC HEALTH:
- LyteBalance: Universal foundation
- Calocurb: GLP-1 support and appetite control
- Cardio Miracle: Cardiovascular and metabolic support
- Apply structured JSON output format

${supplementContext ? `
CURRENT METABOLIC CONTEXT:
- Age: ${supplementContext.healthContext.age || 'Unknown'}
- Gender: ${supplementContext.healthContext.gender || 'Unknown'}
- Current Medications: ${supplementContext.currentMedications.list.map((m: any) => m.name).join(', ') || 'None'}
- Risk Factors: ${supplementContext.riskFactors.medicationInteractions.join('; ') || 'None'}
` : ''}

RETURN STRUCTURED JSON OUTPUT WITH LETSTRUCK PRIORITIZATION.`,

              hormonal: `HORMONAL ANALYSIS - Extract and use ZIP file data

LETSTRUCK PRIORITIZATION FOR HORMONAL HEALTH:
- LyteBalance: Foundation support
- Calocurb: Especially for female clients 40+ (menopause support)
- Consider Biotics Research hormonal support if needed
- Apply structured JSON output format

${supplementContext ? `
CURRENT HORMONAL CONTEXT:
- Gender: ${supplementContext.healthContext.gender || 'Unknown'}
- Age: ${supplementContext.healthContext.age || 'Unknown'}
- Current Hormonal Supplements: ${supplementContext.currentSupplements.list.filter((s: any) => 
  s.name.toLowerCase().includes('hormone') || 
  s.name.toLowerCase().includes('estrogen') ||
  s.name.toLowerCase().includes('testosterone')
).length}
` : ''}

RETURN STRUCTURED JSON OUTPUT WITH LETSTRUCK PRIORITIZATION.`,
            },
            followup: `FOLLOW-UP ANALYSIS - Extract and use ZIP file data

FOLLOW-UP SPECIFIC REQUIREMENTS:
- Compare with previous analysis if available
- Focus on protocol effectiveness and adjustments
- Maintain LetsTruck prioritization hierarchy
- Include cost optimization recommendations

${supplementContext ? `
FOLLOW-UP CONTEXT:
- Previous Analyses: ${supplementContext.metadata.lastAnalysisDate ? 'Available' : 'None'}
- Current Supplement Count: ${supplementContext.currentSupplements.count}
- Estimated Monthly Cost: $${supplementContext.currentSupplements.estimatedMonthlyCost}
- Supplement Gaps: ${supplementContext.metadata.supplementGaps.join(', ') || 'None identified'}
` : ''}

RETURN STRUCTURED JSON OUTPUT WITH LETSTRUCK PRIORITIZATION AND PROGRESS COMPARISON.`,
          },
          clientContext: {
            name: clientName,
            primaryConcerns: "Review extracted data for health goals",
            medications: supplementContext?.currentMedications.list || [],
            currentSupplements: supplementContext?.currentSupplements.list || [],
            allergies: supplementContext?.healthContext.allergies || [],
            isTruckDriver: supplementContext?.healthContext.isTruckDriver || false,
            age: supplementContext?.healthContext.age || null,
            gender: supplementContext?.healthContext.gender || null,
            keyLabs: "Review documents in extracted ZIP file",
            supplementGaps: supplementContext?.metadata.supplementGaps || [],
            riskFactors: supplementContext?.riskFactors.medicationInteractions || [],
          },
        };

        // Dispatch event to show Claude prompts modal
        window.dispatchEvent(
          new CustomEvent("claudePromptsReady", {
            detail: claudePromptsData,
          })
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus("error");
      toast.error("Export Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during export.",
      });
    } finally {
      setIsExporting(false);

      // Reset status after a delay
      setTimeout(() => {
        setExportStatus("idle");
      }, 3000);
    }
  };

  const getButtonIcon = () => {
    if (isExporting) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (exportStatus === "success")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (exportStatus === "error")
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Download className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isExporting) return "Exporting...";
    if (exportStatus === "success") return "Exported!";
    if (exportStatus === "error") return "Export Failed";
    return "Export for Analysis";
  };

  const getButtonVariant = () => {
    if (exportStatus === "success") return "default";
    if (exportStatus === "error") return "destructive";
    return variant;
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={getButtonVariant()}
      size={size}
      className="gap-2"
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}
