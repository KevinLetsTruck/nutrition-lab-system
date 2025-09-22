import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    const { clientId } = params;

    // Fetch comprehensive client data for supplement context
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        Note: {
          where: {
            OR: [
              { currentMedications: { not: null } },
              { generalNotes: { contains: "supplement" } },
              { generalNotes: { contains: "medication" } },
              { generalNotes: { contains: "allerg" } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        Document: {
          where: {
            documentType: { in: ["lab_results", "medical_history", "assessment"] }
          },
          orderBy: { uploadedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Extract current supplements from notes and health goals
    const currentSupplements = extractCurrentSupplements(client);
    const currentMedications = extractCurrentMedications(client);
    const allergies = extractAllergies(client);
    const contraindications = extractContraindications(client);

    // Calculate supplement context
    const supplementContext = {
      clientId,
      clientName: `${client.firstName} ${client.lastName}`,
      
      // Current supplement status
      currentSupplements: {
        list: currentSupplements,
        count: currentSupplements.length,
        estimatedMonthlyCost: calculateSupplementCosts(currentSupplements),
        categories: categorizeSupplements(currentSupplements)
      },

      // Current medications and interactions
      currentMedications: {
        list: currentMedications,
        count: currentMedications.length,
        interactionRisks: assessInteractionRisks(currentMedications),
        contraindications: contraindications
      },

      // Health context
      healthContext: {
        allergies,
        healthGoals: client.healthGoals || {},
        isTruckDriver: client.isTruckDriver,
        age: calculateAge(client.dateOfBirth),
        gender: client.gender,
        conditions: extractHealthConditions(client)
      },

      // Risk factors
      riskFactors: {
        medicationInteractions: assessMedicationRisks(currentMedications),
        allergyRisks: allergies,
        contraindications: contraindications,
        truckerSpecificRisks: assessTruckerRisks(client)
      },

      // LetsTruck prioritization context
      letstruckContext: {
        foundationRecommendation: "LyteBalance", // Universal foundation
        specialtyProducts: getLetsTruckSpecialtyRecommendations(client),
        costOptimization: true,
        truckerCompliance: true
      },

      // Analysis metadata
      metadata: {
        lastAnalysisDate: getLastAnalysisDate(client),
        recentDocuments: client.Document.map(doc => ({
          fileName: doc.fileName,
          type: doc.documentType,
          uploadedAt: doc.uploadedAt
        })),
        supplementGaps: identifySupplementGaps(currentSupplements),
        priorityAreas: extractPriorityAreas(client)
      }
    };

    return NextResponse.json(supplementContext);
  } catch (error) {
    console.error("Supplement context error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch supplement context",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions for supplement context analysis
function extractCurrentSupplements(client: any): any[] {
  const supplements: any[] = [];
  
  // Extract from notes
  client.Note?.forEach((note: any) => {
    if (note.currentMedications) {
      const suppMatches = note.currentMedications.match(/([A-Za-z\s]+(?:mg|mcg|IU|g))/g);
      suppMatches?.forEach((match: string) => {
        if (!supplements.some(s => s.name.toLowerCase().includes(match.toLowerCase()))) {
          supplements.push({
            name: match.trim(),
            source: "note",
            noteDate: note.createdAt
          });
        }
      });
    }
  });

  // Extract from health goals
  const healthGoals = client.healthGoals || {};
  if (healthGoals.currentSupplements) {
    // Parse any existing supplement data
  }

  return supplements;
}

function extractCurrentMedications(client: any): any[] {
  const medications: any[] = [];
  
  client.Note?.forEach((note: any) => {
    if (note.currentMedications) {
      // Parse medication patterns
      const medPatterns = [
        /(\w+)\s*\d+\s*mg/gi, // e.g., "Metformin 500mg"
        /(\w+)\s*\([^)]+\)/gi, // e.g., "Lisinopril (blood pressure)"
      ];
      
      medPatterns.forEach(pattern => {
        const matches = note.currentMedications.match(pattern);
        matches?.forEach((match: string) => {
          if (!medications.some(m => m.name.toLowerCase().includes(match.toLowerCase()))) {
            medications.push({
              name: match.trim(),
              source: "note",
              noteDate: note.createdAt
            });
          }
        });
      });
    }
  });

  return medications;
}

function extractAllergies(client: any): string[] {
  const allergies: string[] = [];
  
  // Extract from allergies field
  if (client.allergies) {
    const allergyData = typeof client.allergies === 'string' 
      ? [client.allergies] 
      : Array.isArray(client.allergies) 
        ? client.allergies 
        : Object.values(client.allergies || {});
    
    allergies.push(...allergyData.filter(Boolean));
  }

  // Extract from notes
  client.Note?.forEach((note: any) => {
    const noteText = (note.generalNotes || '').toLowerCase();
    if (noteText.includes('allerg')) {
      // Extract allergy mentions
      const allergyMatches = noteText.match(/allergic to ([^,.]+)/gi);
      allergyMatches?.forEach((match: string) => {
        const allergy = match.replace(/allergic to /i, '').trim();
        if (!allergies.includes(allergy)) {
          allergies.push(allergy);
        }
      });
    }
  });

  return allergies;
}

function extractContraindications(client: any): string[] {
  const contraindications: string[] = [];
  
  // Based on medications and health conditions
  client.Note?.forEach((note: any) => {
    const noteText = (note.generalNotes || note.healthHistory || '').toLowerCase();
    
    // Look for contraindication keywords
    const contraindicationKeywords = [
      'blood thinner', 'warfarin', 'pregnancy', 'breastfeeding',
      'kidney disease', 'liver disease', 'heart condition'
    ];
    
    contraindicationKeywords.forEach(keyword => {
      if (noteText.includes(keyword)) {
        contraindications.push(keyword);
      }
    });
  });

  return [...new Set(contraindications)];
}

function calculateSupplementCosts(supplements: any[]): number {
  // Estimate costs based on common supplement pricing
  const avgCostPerSupplement = 25; // Average monthly cost
  return supplements.length * avgCostPerSupplement;
}

function categorizeSupplements(supplements: any[]): any {
  const categories = {
    vitamins: 0,
    minerals: 0,
    probiotics: 0,
    adaptogens: 0,
    other: 0
  };

  supplements.forEach(supp => {
    const name = supp.name.toLowerCase();
    if (name.includes('vitamin')) categories.vitamins++;
    else if (name.includes('magnesium') || name.includes('zinc') || name.includes('iron')) categories.minerals++;
    else if (name.includes('probiotic') || name.includes('digestive')) categories.probiotics++;
    else if (name.includes('ashwagandha') || name.includes('rhodiola')) categories.adaptogens++;
    else categories.other++;
  });

  return categories;
}

function assessInteractionRisks(medications: any[]): string[] {
  const risks: string[] = [];
  
  medications.forEach(med => {
    const medName = med.name.toLowerCase();
    
    // Common interaction patterns
    if (medName.includes('warfarin') || medName.includes('blood thinner')) {
      risks.push('Blood thinning medication - avoid high-dose vitamin K, fish oil');
    }
    if (medName.includes('metformin')) {
      risks.push('Metformin - may deplete B12, consider B12 supplementation');
    }
    if (medName.includes('statin')) {
      risks.push('Statin medication - consider CoQ10 supplementation');
    }
  });

  return risks;
}

function assessMedicationRisks(medications: any[]): string[] {
  return medications.map(med => `Check interactions with ${med.name}`);
}

function assessTruckerRisks(client: any): string[] {
  const risks: string[] = [];
  
  if (client.isTruckDriver) {
    risks.push('DOT medical certification - avoid supplements that may affect driving');
    risks.push('Irregular schedule - prioritize easy-to-take supplements');
    risks.push('Limited refrigeration - avoid probiotics requiring cold storage');
    risks.push('Dehydration risk - emphasize electrolyte balance');
  }

  return risks;
}

function calculateAge(dateOfBirth: Date | null): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function extractHealthConditions(client: any): string[] {
  const conditions: string[] = [];
  
  if (client.conditions) {
    const conditionData = typeof client.conditions === 'string'
      ? [client.conditions]
      : Array.isArray(client.conditions)
        ? client.conditions
        : Object.values(client.conditions || {});
    
    conditions.push(...conditionData.filter(Boolean));
  }

  return conditions;
}

function getLastAnalysisDate(client: any): string | null {
  const healthGoals = client.healthGoals || {};
  return healthGoals.analysisDate || null;
}

function getLetsTruckSpecialtyRecommendations(client: any): string[] {
  const recommendations: string[] = [];
  const conditions = extractHealthConditions(client);
  const age = calculateAge(client.dateOfBirth);
  const gender = client.gender?.toLowerCase();

  // LyteBalance - Universal foundation
  recommendations.push('LyteBalance - Universal electrolyte foundation');

  // Calocurb - GLP-1 support, appetite control, menopause
  if (gender === 'female' && age && age > 40) {
    recommendations.push('Calocurb - GLP-1 support and appetite control for menopause');
  }
  if (conditions.some(c => c.toLowerCase().includes('weight') || c.toLowerCase().includes('appetite'))) {
    recommendations.push('Calocurb - Appetite control and metabolic support');
  }

  // Cardio Miracle - Cardiovascular, circulation, diabetes
  if (conditions.some(c => 
    c.toLowerCase().includes('cardiovascular') || 
    c.toLowerCase().includes('diabetes') || 
    c.toLowerCase().includes('circulation')
  )) {
    recommendations.push('Cardio Miracle - Cardiovascular and circulation support');
  }

  return recommendations;
}

function identifySupplementGaps(currentSupplements: any[]): string[] {
  const gaps: string[] = [];
  const suppNames = currentSupplements.map(s => s.name.toLowerCase());

  // Common foundational supplements
  const foundational = [
    { name: 'vitamin d', gap: 'Vitamin D3 deficiency common in truckers' },
    { name: 'magnesium', gap: 'Magnesium essential for sleep and muscle function' },
    { name: 'omega', gap: 'Omega-3 for cardiovascular and brain health' },
    { name: 'probiotic', gap: 'Digestive support important for truckers' }
  ];

  foundational.forEach(item => {
    if (!suppNames.some(name => name.includes(item.name))) {
      gaps.push(item.gap);
    }
  });

  return gaps;
}

function extractPriorityAreas(client: any): string[] {
  const areas: string[] = [];
  
  // Extract from health goals
  const healthGoals = client.healthGoals || {};
  if (healthGoals.analysisHistory && healthGoals.analysisHistory.length > 0) {
    const latestAnalysis = healthGoals.analysisHistory[healthGoals.analysisHistory.length - 1];
    if (latestAnalysis.priorityAreas) {
      areas.push(...latestAnalysis.priorityAreas);
    }
  }

  return areas.slice(0, 5);
}
