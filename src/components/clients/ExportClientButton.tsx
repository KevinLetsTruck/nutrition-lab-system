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
            comprehensive: `# FNTP FUNCTIONAL MEDICINE ANALYSIS & DOCUMENT GENERATION

## CRITICAL INSTRUCTIONS
- ZIP FILE IS READY: ${filename} in your Downloads folder
- EXTRACT and ANALYZE all contents directly
- GENERATE 4 SPECIFIC OUTPUTS as detailed below
- DO NOT ask clarifying questions - proceed with analysis

## SYSTEM ACTIVATION
You are my FNTP functional medicine analysis system. Load all protocols.

## FILE STRUCTURE
- client-data.json: Complete client information
- client-summary.md: Human-readable overview  
- export-metadata.json: System information
- documents/: All client PDF files

## CLIENT OVERVIEW
- Name: ${clientName}
- Export Date: ${new Date().toLocaleDateString()}
${supplementContext ? `
## PRE-ANALYSIS CONTEXT
- Current Medications: ${supplementContext.currentMedications.list.map((m: any) => m.name).join(', ') || 'None'}
- Current Supplements: ${supplementContext.currentSupplements.list.map((s: any) => s.name).join(', ') || 'None'}
- Allergies: ${supplementContext.healthContext.allergies.join(', ') || 'None reported'}
- Contraindications: ${supplementContext.riskFactors.contraindications.join(', ') || 'None'}
- Trucker Status: ${supplementContext.healthContext.isTruckDriver ? 'Yes' : 'No'}
- Age/Gender: ${supplementContext.healthContext.age || 'Unknown'}/${supplementContext.healthContext.gender || 'Unknown'}
` : ''}

## LETSTRUCK PRIORITIZATION RULES (CRITICAL)
1. **LyteBalance**: Universal foundation for ALL clients (unless contraindicated)
   - Cellular hydration, ATP cycle support, 42 years clinical use
   - Dosing: 1-2 capfuls in 8oz water, adjust by taste until mildly salty
2. **Calocurb**: Natural GLP-1 support, appetite control, menopause
   - Multiple protocols: general, menopause, GLP-1 concurrent, GLP-1 discontinuation, intermittent fasting
3. **Cardio Miracle**: NO pathway support, cardiovascular, circulation, diabetes
   - Protocols: general (1 scoop AM), optimal (2 scoops daily), advanced (4 scoops daily)
4. **HIERARCHY**: LetsTruck FIRST → Biotics Research SECOND → FullScript THIRD

## ANALYSIS REQUIREMENTS
1. EXTRACT the ZIP file: ${filename}
2. READ client-data.json for complete client information
3. REVIEW client-summary.md for clinical context
4. ANALYZE all PDF documents thoroughly
5. CHECK current medications for interactions
6. APPLY LetsTruck prioritization rules
7. GENERATE all 4 required outputs below

## MANDATORY OUTPUT 1: STRUCTURED JSON DATA
\`\`\`json
{
  "supplements": [
    {
      "name": "LyteBalance Electrolyte Concentrate",
      "brand": "LetsTruck",
      "dosage": "1-2 capfuls in 8oz water daily",
      "timing": "Morning, adjust by taste",
      "duration": "Ongoing",
      "priority": "CRITICAL",
      "category": "Foundational",
      "rationale": "Universal cellular hydration foundation, supports ATP cycle",
      "phase": "PHASE1",
      "estimatedCost": 45,
      "interactions": "None",
      "contraindications": "None",
      "letstruck_sku": "LT-LYTE-30",
      "biotics_alternative": "Bio-Electrolyte Plus",
      "fullscript_backup": "Designs for Health Electrolyte Synergy",
      "clinicalEvidence": "42 years clinical use, rapid cramp relief",
      "protocolNotes": "Use taste-ability method"
    }
  ],
  "analysisMetadata": {
    "clientId": "${clientId}",
    "analysisDate": "${new Date().toISOString().split('T')[0]}",
    "clinicalPriorities": ["List primary health priorities"],
    "riskFactors": ["List identified risk factors"]
  },
  "costAnalysis": {
    "totalMonthlyCost": 150,
    "phase1Cost": 45,
    "phase2Cost": 90,
    "phase3Cost": 135,
    "costPerDay": 4.50
  },
  "safetyConsiderations": {
    "medicationWarnings": ["List any medication warnings"],
    "contraindications": "None identified",
    "followUpRequired": ["List follow-up items"]
  },
  "phaseTimeline": "Phase 1: 30 days foundation, Phase 2: 60 days targeted, Phase 3: 90 days optimization"
}
\`\`\`

## MANDATORY OUTPUT 2: CLIENT PROTOCOL LETTER
Generate using this EXACT template format:

PROTOCOL TEMPLATE

GREETING
[Warm, personalized greeting to the client]

PHASE # & NAME OF PROTOCOL
[e.g., "Phase 1: Foundation Protocol" or "Phase 2: Targeted Support"]

DURATION: [e.g., "30 days" or "60 days"]
CLINICAL FOCUS: [Primary health priorities being addressed]
CURRENT STATUS: [Brief summary of client's current health situation]

PRIORITY SUPPLEMENTS
    NAME OF PRODUCT: [Full supplement name]
        DOSE: [Specific dosing instructions]
        TIMING: [When to take]
        PURPOSE: [Why this supplement for this client]

    NAME OF PRODUCT: [Second supplement]
        DOSE: [Specific dosing instructions]
        TIMING: [When to take]
        PURPOSE: [Why this supplement for this client]

    [Continue for all recommended supplements]

DAILY PROTOCOL SCHEDULE

    UPON WAKING
    [List supplements/instructions for upon waking]

    BEFORE BREAKFAST
    [List supplements/instructions for before breakfast]

    BETWEEN BREAKFAST & LUNCH
    [List supplements/instructions for mid-morning]

    BEFORE LUNCH
    [List supplements/instructions for before lunch]

    WITH LARGEST MEAL
    [List supplements/instructions for with largest meal]

    BETWEEN LUNCH & DINNER
    [List supplements/instructions for afternoon]

PROTOCOL NOTES
[Important instructions, what to expect, when to follow up, encouraging notes]

## MANDATORY OUTPUT 3: SUPPLEMENT ORDER LIST
Create precise ordering lists organized by vendor:

**LETSTRUCK.COM ORDERS:**
- Product Name | SKU | Quantity | Monthly Supply | Cost

**BIOTICS RESEARCH ORDERS:**
- Product Name | SKU | Quantity | Monthly Supply | Cost

**FULLSCRIPT ORDERS:**
- Product Name | Quantity | Monthly Supply | Cost

Include total costs per vendor and grand total.

## MANDATORY OUTPUT 4: COACHING CALL NOTES
Provide concise bullet points for practitioner use:

**KEY HEALTH PRIORITIES:**
- [Priority 1 with brief rationale]
- [Priority 2 with brief rationale]

**SUPPLEMENT RATIONALE:**
- [Brief explanation for each recommended supplement]

**LIFESTYLE RECOMMENDATIONS:**
- [Specific actionable items]

**FOLLOW-UP MONITORING:**
- [What to track and when]

**RED FLAGS TO WATCH:**
- [Warning signs that require attention]

**CLIENT MOTIVATION STRATEGIES:**
- [Specific approaches for this client's personality/situation]

## SAFETY REQUIREMENTS
- Check ALL medication interactions first
- Include contraindication warnings
- Provide clinical rationale for each recommendation
- Cost analysis with alternatives
- Professional liability considerations

## OUTPUT FORMAT
Provide all four outputs as separate, clearly labeled sections:
1. JSON DATA (in code block)
2. CLIENT PROTOCOL LETTER
3. SUPPLEMENT ORDER LIST  
4. COACHING CALL NOTES

EXTRACT ZIP FILE AND EXECUTE COMPREHENSIVE FNTP ANALYSIS WITH ALL 4 OUTPUTS NOW.`,
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
            followup: `# FNTP FOLLOW-UP ANALYSIS & PROTOCOL ADJUSTMENT

## CRITICAL INSTRUCTIONS
- ZIP FILE IS READY: ${filename} in your Downloads folder
- EXTRACT and ANALYZE all contents directly
- COMPARE with previous analysis if available
- GENERATE 4 SPECIFIC OUTPUTS with protocol adjustments
- FOCUS on progress and optimization

## FOLLOW-UP SPECIFIC REQUIREMENTS
- Compare with previous analysis if available
- Focus on protocol effectiveness and adjustments
- Maintain LetsTruck prioritization hierarchy
- Include cost optimization recommendations
- Assess current protocol compliance

${supplementContext ? `
## FOLLOW-UP CONTEXT
- Previous Analyses: ${supplementContext.metadata.lastAnalysisDate ? 'Available' : 'None'}
- Current Supplement Count: ${supplementContext.currentSupplements.count}
- Estimated Monthly Cost: $${supplementContext.currentSupplements.estimatedMonthlyCost}
- Supplement Gaps: ${supplementContext.metadata.supplementGaps.join(', ') || 'None identified'}
- Protocol Compliance: [Assess from notes and progress]
` : ''}

## FOLLOW-UP ANALYSIS REQUIREMENTS
1. EXTRACT the ZIP file: ${filename}
2. COMPARE current data with previous analysis
3. ASSESS protocol compliance and effectiveness
4. IDENTIFY what's working and what needs adjustment
5. MAINTAIN LetsTruck prioritization hierarchy
6. GENERATE all 4 required outputs with adjustments

## MANDATORY OUTPUT FORMAT
Generate all four outputs as separate, clearly labeled sections:
1. **STRUCTURED JSON DATA** (with progress comparison)
2. **CLIENT PROTOCOL LETTER** (adjusted protocol)
3. **SUPPLEMENT ORDER LIST** (updated recommendations)
4. **COACHING CALL NOTES** (progress review and next steps)

Include progress comparison, protocol adjustments, and optimization recommendations.

EXTRACT ZIP FILE AND EXECUTE FOLLOW-UP ANALYSIS WITH ALL 4 OUTPUTS NOW.`,
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
