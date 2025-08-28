import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

// Response type for consistent API responses
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Interface for extracted supplement information
interface ExtractedSupplement {
  name: string;
  dosage: string;
  timing: string;
  purpose?: string;
  priority: number;
}

/**
 * Extract supplements from Claude analysis text
 * Enhanced to handle Claude's structured format with specific brands and dosing
 */
function extractSupplementsFromAnalysis(analysisText: string): ExtractedSupplement[] {
  const supplements: ExtractedSupplement[] = [];
  
  console.log('Starting supplement extraction from analysis...');
  
  // Enhanced patterns for Claude's structured format
  const supplementPatterns = [
    // Pattern: "**Brand Product Name** - dosage timing"
    /\*\*([^*]+?)\*\*\s*[\-–]\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml|cap))\s+([^.\n]*?)(?=\n|$)/gi,
    
    // Pattern: "Brand Product Name - dosage timing" 
    /^[-*]\s*\*\*([^*]+?)\*\*\s*[-–]\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml|cap))\s+([^.\n]*?)$/gmi,
    
    // Pattern: "- Brand Product Name - dosage timing" (bullet points)
    /^[-*]\s*([A-Za-z][A-Za-z0-9\s\-&]+?)\s*[-–]\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml|cap(?:sules?)?(?:\s+(?:daily|twice|once|before|with|after))?)\s+([^.\n]*?)$/gmi,
    
    // Pattern: "Supplement Name: dosage timing"
    /([A-Za-z][A-Za-z0-9\s\-&]+?):\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml))\s+([^.\n]*)/gi,
    
    // Pattern: "Take X dosage of Supplement Name timing"
    /(?:take|recommend|suggest)\s+([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml))\s+(?:of\s+)?([A-Za-z0-9\s\-&]+)\s+([^.\n]*)/gi,
  ];

  let priority = 1;
  
  // First, look for supplement sections specifically
  const supplementSections = [
    /supplements?\*?\*?\s*(?:\([^)]*\))?\s*:?\s*\n([\s\S]*?)(?=\n#{1,3}|\n\*\*[A-Z]|$)/gi,
    /\*\*supplements?\*\*\s*:?\s*\n([\s\S]*?)(?=\n\*\*[A-Z]|$)/gi,
    /(?:continue|modify|add new)[\s\S]*?supplements?\*?\*?\s*(?:\([^)]*\))?\s*:?\s*\n([\s\S]*?)(?=\n#{1,3}|\n\*\*[A-Z]|$)/gi
  ];
  
  let supplementText = analysisText;
  for (const sectionPattern of supplementSections) {
    const sectionMatch = sectionPattern.exec(analysisText);
    if (sectionMatch && sectionMatch[1]) {
      supplementText = sectionMatch[1];
      console.log('Found supplement section:', supplementText.substring(0, 200) + '...');
      break;
    }
  }
  
  console.log('Applying supplement extraction patterns...');
  
  for (const pattern of supplementPatterns) {
    let match;
    while ((match = pattern.exec(supplementText)) !== null) {
      let [fullMatch, name, dosage, timing] = match;
      
      console.log('Found potential supplement match:', { name, dosage, timing });
      
      // Clean up the extracted data
      const cleanName = name.trim()
        .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
        .replace(/^[-*]\s*/, '') // Remove bullet points
        .replace(/[:\-()]/g, ' ') // Replace separators with spaces
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      const cleanDosage = dosage.trim();
      let cleanTiming = timing.trim()
        .replace(/[.\n]/g, ' ') // Replace dots/newlines with spaces
        .replace(/\s+/g, ' ') // Normalize spaces
        .substring(0, 150)
        .trim();
      
      if (!cleanTiming) cleanTiming = 'as directed';
      
      // Skip if name is too short, too long, or looks like a sentence
      if (cleanName.length < 5 || cleanName.length > 80 || cleanName.split(' ').length > 8) {
        console.log('Skipping due to name length/format:', cleanName);
        continue;
      }
      
      // Skip if it doesn't look like a supplement name
      if (!/[A-Za-z]/.test(cleanName) || /^\d+$/.test(cleanName)) {
        console.log('Skipping due to invalid name format:', cleanName);
        continue;
      }
      
      // Check if supplement already exists (case insensitive)
      const existingIndex = supplements.findIndex(s => 
        s.name.toLowerCase() === cleanName.toLowerCase() ||
        cleanName.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(cleanName.toLowerCase())
      );
      
      if (existingIndex === -1) {
        const newSupplement = {
          name: cleanName,
          dosage: cleanDosage,
          timing: cleanTiming,
          priority: priority++,
        };
        
        supplements.push(newSupplement);
        console.log('Added supplement:', newSupplement);
      } else {
        console.log('Supplement already exists, skipping duplicate:', cleanName);
      }
    }
  }
  
  // Fallback: Look for branded supplements mentioned in text
  const brandPatterns = [
    /(?:Biotics Research|LetsTruck|Thorne|Designs for Health|Integrative Therapeutics)\s+([A-Za-z0-9\s\-]+)/gi,
    /([A-Za-z0-9\s\-]+)\s+(?:Complex|Complete|Forte|Plus|Advanced|Premium)/gi
  ];
  
  for (const brandPattern of brandPatterns) {
    let match;
    while ((match = brandPattern.exec(analysisText)) !== null) {
      const productName = match[1] || match[0];
      const cleanName = productName.trim().replace(/\s+/g, ' ');
      
      if (cleanName.length >= 5 && cleanName.length <= 50 && 
          !supplements.some(s => s.name.toLowerCase().includes(cleanName.toLowerCase()))) {
        
        // Try to find dosage info near this product mention
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(analysisText.length, match.index + match[0].length + 100);
        const context = analysisText.substring(contextStart, contextEnd);
        
        const dosageMatch = context.match(/([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml))/i);
        const timingMatch = context.match(/(once|twice|three times|daily|morning|evening|before meals?|with meals?|after meals?|as directed)/i);
        
        supplements.push({
          name: cleanName,
          dosage: dosageMatch ? dosageMatch[1] : 'as recommended',
          timing: timingMatch ? timingMatch[1] : 'as directed',
          priority: priority++,
        });
        
        console.log('Added branded supplement:', cleanName);
      }
    }
  }
  
  console.log(`Total supplements extracted: ${supplements.length}`);
  supplements.forEach((supp, index) => {
    console.log(`${index + 1}. ${supp.name} - ${supp.dosage} ${supp.timing}`);
  });
  
  return supplements.slice(0, 15); // Limit to 15 supplements
}

/**
 * Extract greeting and clinical focus from analysis
 */
function extractProtocolMetadata(analysisText: string, clientName: string) {
  console.log('Extracting protocol metadata for:', clientName);
  
  // Generate personalized greeting based on analysis type
  const isFollowUp = /follow[\-\s]*up/i.test(analysisText);
  const isIntensive = /intensive/i.test(analysisText);
  
  let greeting;
  if (isFollowUp) {
    greeting = `Dear ${clientName},

Based on your follow-up assessment and recent progress, I've updated your protocol to address your current needs and continue supporting your health journey.`;
  } else if (isIntensive) {
    greeting = `Dear ${clientName},

Given the current health priorities identified in your assessment, I've designed an intensive protocol to provide focused support for your wellness goals.`;
  } else {
    greeting = `Dear ${clientName},

Based on your comprehensive functional medicine assessment, I've created this personalized protocol to address your unique health needs and support your wellness journey.`;
  }

  // Enhanced clinical focus extraction
  let clinicalFocus = '';
  
  // Look for progress assessment or overall trajectory
  const progressMatch = analysisText.match(/(?:progress assessment|overall trajectory|critical concerns?)[:\n]([^#]*?)(?=\n#{1,3}|\n\n[A-Z]|$)/i);
  if (progressMatch) {
    clinicalFocus = progressMatch[1]
      .trim()
      .replace(/\*\*/g, '') // Remove markdown formatting
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .substring(0, 400);
    console.log('Found progress assessment for clinical focus');
  }
  
  // Look for critical concerns section
  if (!clinicalFocus) {
    const criticalMatch = analysisText.match(/critical concerns?[:\n]([^#]*?)(?=\n#{1,3}|\n\n[A-Z]|$)/i);
    if (criticalMatch) {
      clinicalFocus = criticalMatch[1]
        .trim()
        .replace(/\*\*/g, '') // Remove markdown formatting
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .substring(0, 400);
      console.log('Found critical concerns for clinical focus');
    }
  }
  
  // Look for executive summary section
  if (!clinicalFocus) {
    const executiveSummaryMatch = analysisText.match(/executive summary[:\n]([^#]*?)(?=\n#{1,3}|\n\n[A-Z]|$)/i);
    if (executiveSummaryMatch) {
      clinicalFocus = executiveSummaryMatch[1]
        .trim()
        .replace(/\*\*/g, '') // Remove markdown formatting
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .substring(0, 400);
      console.log('Found executive summary for clinical focus');
    }
  }
  
  // Look for primary concerns or root causes
  if (!clinicalFocus) {
    const healthConcernMatch = analysisText.match(/(primary concerns?|main issues?|key findings?|root cause[s]?)[:\n]([^#]*?)(?=\n#{1,3}|\n\n[A-Z]|$)/i);
    if (healthConcernMatch) {
      clinicalFocus = healthConcernMatch[2]
        .trim()
        .replace(/\*\*/g, '') // Remove markdown formatting
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .substring(0, 400);
      console.log('Found health concerns for clinical focus');
    }
  }
  
  // Look for persistent challenges section
  if (!clinicalFocus) {
    const challengesMatch = analysisText.match(/persistent challenges[:\n]([^#]*?)(?=\n#{1,3}|\n\n[A-Z]|$)/i);
    if (challengesMatch) {
      clinicalFocus = challengesMatch[1]
        .trim()
        .replace(/\*\*/g, '') // Remove markdown formatting
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .substring(0, 400);
      console.log('Found persistent challenges for clinical focus');
    }
  }
  
  // Condition-specific fallbacks
  if (!clinicalFocus) {
    if (/diabetes|diabetic|glucose|HbA1c/i.test(analysisText)) {
      clinicalFocus = 'Focused on optimizing glucose control, managing insulin resistance, and preventing diabetic complications through targeted nutritional and lifestyle interventions.';
    } else if (/digestive|gut|microbiome/i.test(analysisText)) {
      clinicalFocus = 'Comprehensive approach to restore digestive function, balance gut microbiome, and address underlying GI dysfunction patterns.';
    } else if (/thyroid/i.test(analysisText)) {
      clinicalFocus = 'Targeted support for optimal thyroid function through nutritional optimization and metabolic pathway enhancement.';
    } else if (/adrenal|stress|fatigue/i.test(analysisText)) {
      clinicalFocus = 'Comprehensive adrenal support protocol to address stress response dysfunction and restore energy balance.';
    } else {
      clinicalFocus = 'Comprehensive functional medicine approach to address identified health patterns and optimize overall wellness.';
    }
  }
  
  // Clean up clinical focus
  clinicalFocus = clinicalFocus
    .trim()
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/^[-*•]\s*/, '') // Remove bullet points
    .replace(/\.$/, '') // Remove trailing period
    + '.'; // Add period at end
  
  console.log('Generated clinical focus:', clinicalFocus.substring(0, 100) + '...');
  
  return { greeting, clinicalFocus };
}

/**
 * POST /api/protocols/create-from-analysis
 * Create a protocol from existing Claude analysis data
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Create from analysis request body:', body);

    // Validate required fields
    if (!body.analysisId) {
      console.log('Missing analysisId in request');
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "Missing required field: analysisId",
        },
        { status: 400 }
      );
    }

    // Fetch the analysis with client data
    const analysis = await prisma.clientAnalysis.findUnique({
      where: { id: body.analysisId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    const clientName = `${analysis.client.firstName} ${analysis.client.lastName}`;
    
    // Auto-generate protocol name if not provided
    let protocolName = body.protocolName;
    if (!protocolName || protocolName.trim() === "") {
      console.log('Auto-generating protocol name from analysis...');
      
      // Enhanced protocol name extraction patterns
      const namePatterns = [
        // Look for specific health conditions or systems
        /(?:diabetes|diabetic|glucose|blood sugar|insulin resistance|HbA1c)/i,
        /(?:digestive|gut|gastrointestinal|GI|microbiome)/i,
        /(?:thyroid|hypothyroid|hyperthyroid|TSH|T3|T4)/i,
        /(?:adrenal|cortisol|stress|fatigue)/i,
        /(?:hormonal?|hormone|estrogen|testosterone|progesterone)/i,
        /(?:cardiovascular|heart|blood pressure|cholesterol)/i,
        /(?:neurological|brain|cognitive|memory)/i,
        /(?:autoimmune|inflammation|inflammatory)/i,
        /(?:kidney|renal|nephropathy)/i,
        /(?:metabolic|metabolism|weight)/i
      ];
      
      // Try condition-specific naming first
      for (const pattern of namePatterns) {
        const match = analysis.fullAnalysis.match(pattern);
        if (match) {
          const condition = match[0].toLowerCase();
          console.log('Found health condition:', condition);
          
          // Create specific protocol names based on condition
          switch (condition) {
            case 'diabetes':
            case 'diabetic':
            case 'glucose':
            case 'blood sugar':
            case 'insulin resistance':
            case 'hbA1c':
              protocolName = 'Diabetes Management Protocol';
              break;
            case 'digestive':
            case 'gut':
            case 'gastrointestinal':
            case 'gi':
            case 'microbiome':
              protocolName = 'Digestive Health Protocol';
              break;
            case 'thyroid':
            case 'hypothyroid':
            case 'hyperthyroid':
            case 'tsh':
            case 't3':
            case 't4':
              protocolName = 'Thyroid Support Protocol';
              break;
            case 'adrenal':
            case 'cortisol':
            case 'stress':
            case 'fatigue':
              protocolName = 'Adrenal Support Protocol';
              break;
            case 'hormonal':
            case 'hormone':
            case 'estrogen':
            case 'testosterone':
            case 'progesterone':
              protocolName = 'Hormonal Balance Protocol';
              break;
            case 'cardiovascular':
            case 'heart':
            case 'blood pressure':
            case 'cholesterol':
              protocolName = 'Cardiovascular Health Protocol';
              break;
            case 'autoimmune':
            case 'inflammation':
            case 'inflammatory':
              protocolName = 'Anti-Inflammatory Protocol';
              break;
            case 'kidney':
            case 'renal':
            case 'nephropathy':
              protocolName = 'Kidney Support Protocol';
              break;
            case 'metabolic':
            case 'metabolism':
            case 'weight':
              protocolName = 'Metabolic Optimization Protocol';
              break;
            default:
              protocolName = `${condition.charAt(0).toUpperCase() + condition.slice(1)} Protocol`;
          }
          break;
        }
      }
      
      // If no condition-specific match, try other patterns
      if (!protocolName || protocolName.includes('undefined')) {
        const focusMatch = analysis.fullAnalysis.match(/(?:primary|main|key|critical)\s*(?:concern[s]?|issue[s]?|focus|goal)[s]?[:\-\s]*([^\n.]{10,80})/i);
        const phaseMatch = analysis.fullAnalysis.match(/phase\s*([0-9]+)/i);
        const followUpMatch = analysis.fullAnalysis.match(/follow[\-\s]*up/i);
        const intensiveMatch = analysis.fullAnalysis.match(/intensive/i);
        
        if (followUpMatch) {
          protocolName = 'Follow-Up Protocol';
        } else if (intensiveMatch) {
          protocolName = 'Intensive Support Protocol';
        } else if (phaseMatch) {
          protocolName = `Phase ${phaseMatch[1]} Protocol`;
        } else if (focusMatch) {
          let focus = focusMatch[1].trim()
            .replace(/[^\w\s]/g, '') // Remove special chars
            .replace(/\s+/g, ' ') // Normalize spaces
            .substring(0, 40); // Limit length
          
          if (focus.length > 5) {
            protocolName = `${focus} Protocol`;
          }
        }
      }
      
      // Final fallback
      if (!protocolName || protocolName.includes('undefined') || protocolName.length < 5) {
        const analysisDate = new Date(analysis.analysisDate).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric', 
          year: '2-digit'
        }).replace(/\//g, '');
        protocolName = `Functional Protocol - ${analysisDate}`;
      }
      
      // Clean up the generated name
      protocolName = protocolName
        .replace(/[^\w\s\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 80);
        
      console.log('Generated protocol name:', protocolName);
    }
    
    // Extract supplements from analysis text
    const extractedSupplements = extractSupplementsFromAnalysis(analysis.fullAnalysis);
    
    // Extract metadata
    const { greeting, clinicalFocus } = extractProtocolMetadata(analysis.fullAnalysis, clientName);
    
    // Extract dietary guidelines from analysis
    let dietaryGuidelines = null;
    const dietaryMatch = analysis.fullAnalysis.match(/diet[ary]*\s*(?:recommendations?|guidelines?)[:\n]([^#]*?)(?=\n#|\n\n[A-Z]|$)/i);
    if (dietaryMatch) {
      dietaryGuidelines = {
        recommendations: dietaryMatch[1].trim().split('\n').filter(line => line.trim()),
        extractedFrom: 'analysis'
      };
    }
    
    // Extract lifestyle modifications
    let lifestyleModifications = null;
    const lifestyleMatch = analysis.fullAnalysis.match(/lifestyle\s*(?:modifications?|recommendations?)[:\n]([^#]*?)(?=\n#|\n\n[A-Z]|$)/i);
    if (lifestyleMatch) {
      lifestyleModifications = {
        recommendations: lifestyleMatch[1].trim().split('\n').filter(line => line.trim()),
        extractedFrom: 'analysis'
      };
    }

    // Create priority supplements JSON
    const prioritySupplements = extractedSupplements.slice(0, 5).map(supplement => ({
      name: supplement.name,
      dosage: supplement.dosage,
      timing: supplement.timing,
      priority: supplement.priority,
    }));

    // Use transaction to create protocol and related data
    const protocol = await prisma.$transaction(async (tx) => {
      // Create the main protocol
      const newProtocol = await tx.enhancedProtocol.create({
        data: {
          clientId: analysis.clientId,
          analysisId: analysis.id,
          protocolName: protocolName,
          protocolPhase: body.protocolPhase || "Phase 1",
          supplements: {
            total: extractedSupplements.length,
            categories: ['Core Supplements', 'Targeted Support'],
            extractedFrom: 'analysis'
          },
          dietaryGuidelines,
          lifestyleModifications,
          monitoringRequirements: {
            followUpWeeks: [2, 4, 8, 12],
            keyMetrics: ['symptoms', 'energy', 'digestion', 'sleep'],
            extractedFrom: 'analysis'
          },
          startDate: body.startDate && body.startDate !== "" ? new Date(body.startDate) : new Date(),
          durationWeeks: body.durationWeeks || 12,
          status: body.status || "planned",
          greeting,
          clinicalFocus,
          currentStatus: "Protocol created from analysis - ready for review",
          prioritySupplements,
          dailySchedule: body.dailySchedule || {
            morning: "8:00 AM",
            evening: "6:00 PM",
            description: "Standard morning and evening routine"
          },
          protocolNotes: `Auto-generated from Claude analysis on ${new Date().toISOString().split('T')[0]}. ${extractedSupplements.length} supplements extracted. Please review and customize as needed.`,
          brandingConfig: {
            theme: 'professional',
            includeGreeting: true,
            includeClinicLogo: true,
            extractedFrom: 'analysis'
          },
        },
      });

      // Create associated supplements
      if (extractedSupplements.length > 0) {
        await tx.protocolSupplement.createMany({
          data: extractedSupplements.map((supplement) => ({
            protocolId: newProtocol.id,
            productName: supplement.name,
            dosage: supplement.dosage,
            timing: supplement.timing,
            purpose: supplement.purpose || 'As recommended in analysis',
            priority: supplement.priority,
            isActive: true,
            startDate: body.startDate && body.startDate !== "" ? new Date(body.startDate) : new Date(),
          })),
        });
      }

      console.log('Protocol created successfully with name:', protocolName);
      return newProtocol;
    });

    // Fetch the created protocol with related data
    const protocolWithData = await prisma.enhancedProtocol.findUnique({
      where: { id: protocol.id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        analysis: {
          select: {
            id: true,
            analysisDate: true,
            analysisVersion: true,
          },
        },
        protocolSupplements: {
          orderBy: { priority: "asc" },
        },
        protocolGenerations: true,
      },
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        protocol: protocolWithData,
        extractedSupplementsCount: extractedSupplements.length,
        metadata: {
          greeting: !!greeting,
          clinicalFocus: !!clinicalFocus,
          dietaryGuidelines: !!dietaryGuidelines,
          lifestyleModifications: !!lifestyleModifications,
        },
      },
    });

  } catch (error: any) {
    console.error("Error creating protocol from analysis:", error);
    
    // Check if it's a Prisma validation error
    if (error.code === 'P2002') {
      console.error("Unique constraint violation:", error.meta);
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "Protocol with similar data already exists",
        },
        { status: 409 }
      );
    }
    
    // Check if it's a missing field error
    if (error.code === 'P2012') {
      console.error("Missing required field:", error.meta);
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "Missing required database field",
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: `Failed to create protocol from analysis: ${error.message || 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
