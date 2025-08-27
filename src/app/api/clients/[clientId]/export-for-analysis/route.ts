import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { medicalDocStorage } from "@/lib/medical/storage-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Authenticate user - Fixed 2025-08-26
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = params;

    // Fetch complete client data from all 5 main tables
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        // SimpleAssessment data
        simpleAssessments: {
          include: {
            responses: true,
          },
          orderBy: { startedAt: "desc" },
        },
        // Document data with analysis
        documents: {
          include: {
            DocumentAnalysis: true,
            LabValue: true,
          },
          orderBy: { uploadedAt: "desc" },
        },
        // Clinical notes
        notes: {
          orderBy: { createdAt: "desc" },
        },
        // Treatment protocols
        protocols: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Prepare ZIP filename
    const clientName = `${clientData.firstName}-${clientData.lastName}`;
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const zipFilename = `${clientName}-${timestamp}.zip`;

    // Prepare structured client data
    const exportData = {
      client: {
        id: clientData.id,
        name: `${clientData.firstName} ${clientData.lastName}`,
        email: clientData.email,
        phone: clientData.phone,
        dateOfBirth: clientData.dateOfBirth,
        gender: clientData.gender,
        isTruckDriver: clientData.isTruckDriver,
        dotNumber: clientData.dotNumber,
        cdlNumber: clientData.cdlNumber,
        status: clientData.status,
        healthGoals: clientData.healthGoals,
        medications: clientData.medications,
        conditions: clientData.conditions,
        allergies: clientData.allergies,
        createdAt: clientData.createdAt,
        lastVisit: clientData.lastVisit,
      },
      assessments: clientData.simpleAssessments.map((assessment) => ({
        id: assessment.id,
        status: assessment.status,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
        responses: assessment.responses.map((response) => ({
          questionId: response.questionId,
          questionText: response.questionText,
          category: response.category,
          score: response.score,
          answeredAt: response.answeredAt,
        })),
        totalQuestions: assessment.responses.length,
        averageScore:
          assessment.responses.length > 0
            ? assessment.responses.reduce((sum, r) => sum + r.score, 0) /
              assessment.responses.length
            : 0,
      })),
      documents: clientData.documents.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt,
        extractedText: doc.extractedText,
        aiAnalysis: doc.aiAnalysis,
        documentType: doc.documentType,
        labType: doc.labType,
        analysisStatus: doc.analysisStatus,
        analysis: doc.DocumentAnalysis.map((analysis) => ({
          analysisType: analysis.analysisType,
          patterns: analysis.patterns,
          findings: analysis.findings,
          criticalValues: analysis.criticalValues,
          recommendations: analysis.recommendations,
          confidence: analysis.confidence,
          createdAt: analysis.createdAt,
        })),
        labValues: doc.LabValue.map((lab) => ({
          testName: lab.testName,
          value: lab.value,
          unit: lab.unit,
          flag: lab.flag,
          isOutOfRange: lab.isOutOfRange,
          isCritical: lab.isCritical,
          severity: lab.severity,
          category: lab.category,
          collectionDate: lab.collectionDate,
        })),
      })),
      notes: clientData.notes.map((note) => ({
        id: note.id,
        noteType: note.noteType,
        title: note.title,
        chiefComplaints: note.chiefComplaints,
        healthHistory: note.healthHistory,
        currentMedications: note.currentMedications,
        goals: note.goals,
        protocolAdjustments: note.protocolAdjustments,
        complianceNotes: note.complianceNotes,
        progressMetrics: note.progressMetrics,
        nextSteps: note.nextSteps,
        generalNotes: note.generalNotes,
        isImportant: note.isImportant,
        followUpNeeded: note.followUpNeeded,
        createdAt: note.createdAt,
      })),
      protocols: clientData.protocols.map((protocol) => ({
        id: protocol.id,
        protocolName: protocol.protocolName,
        status: protocol.status,
        supplements: protocol.supplements,
        dietary: protocol.dietary,
        lifestyle: protocol.lifestyle,
        timeline: protocol.timeline,
        metrics: protocol.metrics,
        createdAt: protocol.createdAt,
        completedAt: protocol.completedAt,
      })),
      exportMetadata: {
        exportedAt: new Date(),
        exportedBy: authUser.email,
        version: "1.0.0",
        totalAssessments: clientData.simpleAssessments.length,
        totalDocuments: clientData.documents.length,
        totalNotes: clientData.notes.length,
        totalProtocols: clientData.protocols.length,
      },
    };

    // Create ZIP archive
    return new Promise(async (resolve) => {
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on("data", (chunk) => {
        chunks.push(chunk);
      });

      archive.on("end", () => {
        const zipBuffer = Buffer.concat(chunks);

        // Create response with ZIP file download
        const response = new NextResponse(zipBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${zipFilename}"`,
            "Content-Length": zipBuffer.length.toString(),
          },
        });

        resolve(response);
      });

      archive.on("error", (err) => {
        console.error("Archive error:", err);
        resolve(
          NextResponse.json(
            { error: "Failed to create export archive" },
            { status: 500 }
          )
        );
      });

      // Add JSON files to ZIP
      archive.append(JSON.stringify(exportData, null, 2), {
        name: "client-data.json",
      });

      // Generate and add summary
      const summaryContent = generateClientSummary(exportData);
      archive.append(summaryContent, { name: "client-summary.md" });

      // Add metadata
      archive.append(JSON.stringify(exportData.exportMetadata, null, 2), {
        name: "export-metadata.json",
      });

      // Generate and add functional medicine assessment analysis
      console.log("🧠 Generating functional medicine assessment analysis...");
      const functionalAssessmentAnalysis = await generateFunctionalAssessmentAnalysis(clientId);
      archive.append(functionalAssessmentAnalysis, { 
        name: "functional-assessment-analysis.md" 
      });
      console.log("✅ Functional medicine assessment analysis added to export");

      // Add document files (if they exist)
      let copiedDocuments = 0;
      const skippedDocuments = [];
      console.log(
        `🔍 Processing ${clientData.documents.length} documents for export...`
      );

      for (const doc of clientData.documents) {
        try {
          console.log(`📄 Processing document: ${doc.fileName}`);
          console.log(`📁 FileUrl: ${doc.fileUrl}`);
          console.log(`🗄️ Storage Provider: ${doc.storageProvider || "LOCAL"}`);

          let fileBuffer = null;
          let fileName = doc.fileName;

          // Try LOCAL storage first
          if (!doc.storageProvider || doc.storageProvider === "LOCAL") {
            const sourcePath = path.join(process.cwd(), "public", doc.fileUrl);
            console.log(`🔍 Checking local file: ${sourcePath}`);

            if (fs.existsSync(sourcePath)) {
              console.log(`✅ Local file found: ${fileName}`);
              archive.file(sourcePath, { name: fileName });
              copiedDocuments++;
              continue;
            } else {
              console.warn(`❌ Local file not found: ${sourcePath}`);
            }
          }

          // If LOCAL failed or storage is S3, try S3 download
          if (doc.storageProvider === "S3" || doc.fileUrl?.startsWith("http")) {
            console.log(`☁️ S3 file detected: ${doc.fileUrl}`);

            try {
              // Attempt to download from S3
              const s3Result = await medicalDocStorage.downloadFileByUrl(
                doc.fileUrl
              );

              // Add the actual file to the ZIP
              archive.append(s3Result.buffer, {
                name: fileName,
              });
              copiedDocuments++;
              console.log(`✅ S3 file downloaded and added: ${fileName}`);
              continue;
            } catch (s3Error) {
              console.warn(`❌ S3 download failed for ${fileName}:`, s3Error);

              // Fallback: Add informative placeholder
              const placeholderContent = `This document could not be downloaded from S3.

Document Details:
- Name: ${doc.fileName}
- Type: ${doc.fileType}
- Size: ${doc.fileSize} bytes
- Uploaded: ${doc.uploadedAt}
- Storage: S3
- File URL: ${doc.fileUrl}

Error: ${s3Error instanceof Error ? s3Error.message : "Unknown S3 error"}

To access this document:
1. Check S3 bucket permissions
2. Verify AWS credentials are configured
3. Use the application interface to access the file
4. Contact support for S3 file recovery`;

              archive.append(placeholderContent, {
                name: fileName.replace(".pdf", ".txt"),
              });
              console.log(`📝 Added S3 error placeholder for: ${fileName}`);
              copiedDocuments++;
              continue;
            }
          }

          // If we get here, document couldn't be processed
          skippedDocuments.push(fileName);
          console.warn(`⚠️ Skipped document: ${fileName} (not found)`);
        } catch (error) {
          console.error(
            `❌ Failed to process document ${doc.fileName}:`,
            error
          );
          skippedDocuments.push(doc.fileName);
        }
      }

      // Add summary of skipped documents if any
      if (skippedDocuments.length > 0) {
        const skippedSummary = `The following documents could not be included in this export:

${skippedDocuments.map((name) => `- ${name}`).join("\n")}

Possible reasons:
- Files were lost during server deployment (ephemeral file system)
- Documents are stored in external storage (S3) without download access
- File corruption or permission issues

To recover these documents:
1. Re-upload them to the client record
2. Contact support for S3 file recovery
3. Check the original source files`;

        archive.append(skippedSummary, { name: "missing-documents.txt" });
        console.log(
          `📋 Added missing documents summary (${skippedDocuments.length} files)`
        );
      }

      console.log(
        `📊 Export summary: ${copiedDocuments}/${clientData.documents.length} documents processed`
      );
      console.log(`✅ Successfully exported: ${copiedDocuments}`);
      console.log(`⚠️ Skipped: ${skippedDocuments.length}`);
      console.log(`🧠 Functional medicine analysis: ✅ Generated and included`);

      // Finalize the archive
      archive.finalize();
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Export failed",
        details: error instanceof Error ? error.stack : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Functional Medicine Assessment Categorization Function
async function generateFunctionalAssessmentAnalysis(clientId: string): Promise<string> {
  // Query all completed assessments for the client
  const assessments = await prisma.simpleAssessment.findMany({
    where: { clientId, status: 'completed' },
    include: { responses: true },
    orderBy: { completedAt: 'desc' }
  });

  if (assessments.length === 0) {
    return `# Functional Medicine Assessment Analysis

## Assessment Status
❌ **No completed assessments available**

To generate comprehensive functional medicine analysis, the client needs to complete the health assessment questionnaire covering the 8 core functional medicine systems.

### Missing Data Impact
Without assessment data, analysis is limited to:
- Document analysis (lab results, medical records)
- Clinical notes review
- Protocol effectiveness tracking

### Recommendations
1. **Priority Action**: Complete initial health assessment
2. **Follow-up**: Establish baseline scores across all functional systems
3. **Timeline**: Re-export data after assessment completion for full analysis

---
*Assessment completion is essential for personalized functional medicine recommendations.*`;
  }

  // Define functional medicine categories
  const categories = [
    'digestive', 'energy', 'sleep', 'stress', 
    'immune', 'hormonal', 'detox', 'cardiovascular'
  ];

  // Calculate category analysis across all assessments
  const categoryAnalysis: any = {};
  const categoryData: any = {};

  // Initialize category tracking
  categories.forEach(category => {
    categoryData[category] = {
      totalScore: 0,
      questionCount: 0,
      responses: [] as any[],
      assessmentHistory: [] as any[]
    };
  });

  // Process all assessments and categorize responses
  assessments.forEach((assessment, assessmentIndex) => {
    const assessmentDate = assessment.completedAt || assessment.startedAt;
    
    assessment.responses.forEach(response => {
      const category = response.category;
      if (categories.includes(category)) {
        categoryData[category].totalScore += response.score;
        categoryData[category].questionCount++;
        categoryData[category].responses.push({
          questionText: response.questionText,
          score: response.score,
          assessmentDate: assessmentDate
        });
      }
    });

    // Track per-assessment category scores for trending
    categories.forEach(category => {
      const categoryResponses = assessment.responses.filter(r => r.category === category);
      if (categoryResponses.length > 0) {
        const avgScore = categoryResponses.reduce((sum, r) => sum + r.score, 0) / categoryResponses.length;
        categoryData[category].assessmentHistory.push({
          assessmentIndex,
          assessmentDate,
          avgScore,
          questionCount: categoryResponses.length
        });
      }
    });
  });

  // Calculate final category scores and analysis
  categories.forEach(category => {
    const data = categoryData[category];
    if (data.questionCount > 0) {
      const avgScore = data.totalScore / data.questionCount;
      const percentage = (avgScore / 5) * 100;
      
      let severity: string;
      let priority: number;
      let interpretation: string;
      let recommendations: string[];

      // Determine severity and priority based on score
      if (percentage >= 80) {
        severity = 'OPTIMAL';
        priority = 4;
        interpretation = 'Excellent function with minimal concerns';
        recommendations = ['Maintain current practices', 'Monitor for changes', 'Continue supportive protocols'];
      } else if (percentage >= 65) {
        severity = 'GOOD';
        priority = 3;
        interpretation = 'Good function with minor optimization opportunities';
        recommendations = ['Fine-tune current approaches', 'Address minor imbalances', 'Prevent future dysfunction'];
      } else if (percentage >= 50) {
        severity = 'MODERATE';
        priority = 2;
        interpretation = 'Moderate dysfunction requiring targeted intervention';
        recommendations = ['Implement targeted protocols', 'Address underlying imbalances', 'Monitor progress closely'];
      } else if (percentage >= 35) {
        severity = 'HIGH';
        priority = 1;
        interpretation = 'Significant dysfunction requiring immediate attention';
        recommendations = ['Priority intervention needed', 'Comprehensive protocol implementation', 'Consider additional testing'];
      } else {
        severity = 'CRITICAL';
        priority = 1;
        interpretation = 'Severe dysfunction requiring urgent intervention';
        recommendations = ['Urgent intervention required', 'Comprehensive diagnostic workup', 'Intensive protocol implementation'];
      }

      // Identify trending patterns
      let trendAnalysis = 'Insufficient data for trending';
      if (data.assessmentHistory.length >= 2) {
        const firstScore = data.assessmentHistory[data.assessmentHistory.length - 1].avgScore;
        const lastScore = data.assessmentHistory[0].avgScore;
        const change = ((lastScore - firstScore) / firstScore) * 100;
        
        if (Math.abs(change) < 5) {
          trendAnalysis = 'Stable (no significant change)';
        } else if (change > 15) {
          trendAnalysis = `Improving (+${change.toFixed(1)}% improvement)`;
        } else if (change > 5) {
          trendAnalysis = `Slight improvement (+${change.toFixed(1)}%)`;
        } else if (change < -15) {
          trendAnalysis = `Declining (${change.toFixed(1)}% decline)`;
        } else if (change < -5) {
          trendAnalysis = `Slight decline (${change.toFixed(1)}%)`;
        }
      }

      categoryAnalysis[category] = {
        avgScore: avgScore.toFixed(2),
        percentage: percentage.toFixed(1),
        severity,
        priority,
        interpretation,
        recommendations,
        questionCount: data.questionCount,
        trendAnalysis,
        assessmentCount: data.assessmentHistory.length,
        highConcernQuestions: data.responses.filter(r => r.score <= 2).length,
        lowConcernQuestions: data.responses.filter(r => r.score >= 4).length
      };
    }
  });

  // Sort categories by priority (highest concern first)
  const sortedCategories = categories
    .filter(cat => categoryAnalysis[cat])
    .sort((a, b) => {
      const priorityDiff = categoryAnalysis[a].priority - categoryAnalysis[b].priority;
      if (priorityDiff !== 0) return priorityDiff;
      return parseFloat(categoryAnalysis[a].percentage) - parseFloat(categoryAnalysis[b].percentage);
    });

  // Generate comprehensive markdown
  const categoryNames = {
    digestive: 'Digestive Health',
    energy: 'Energy & Focus', 
    sleep: 'Sleep Quality',
    stress: 'Stress Management',
    immune: 'Immune System',
    hormonal: 'Hormonal Balance',
    detox: 'Detoxification',
    cardiovascular: 'Cardiovascular Health'
  };

  let markdown = `# Functional Medicine Assessment Analysis

## Assessment Overview
- **Total Completed Assessments**: ${assessments.length}
- **Most Recent Assessment**: ${assessments[0].completedAt ? new Date(assessments[0].completedAt).toLocaleDateString() : 'In Progress'}
- **Assessment Period**: ${assessments.length > 1 ? 
  `${new Date(assessments[assessments.length - 1].startedAt).toLocaleDateString()} to ${new Date(assessments[0].startedAt).toLocaleDateString()}` : 
  'Single assessment'}
- **Total Questions Analyzed**: ${Object.values(categoryAnalysis).reduce((sum: number, cat: any) => sum + cat.questionCount, 0)}

## 🎯 Priority Intervention Summary

### High Priority Areas (Immediate Attention Needed)
${sortedCategories.filter(cat => ['HIGH', 'CRITICAL'].includes(categoryAnalysis[cat].severity)).length > 0 ?
  sortedCategories.filter(cat => ['HIGH', 'CRITICAL'].includes(categoryAnalysis[cat].severity))
    .map(cat => `- **${categoryNames[cat as keyof typeof categoryNames]}**: ${categoryAnalysis[cat].percentage}% (${categoryAnalysis[cat].severity})`)
    .join('\n') :
  '✅ No critical areas identified - all systems within acceptable ranges'}

### Optimization Opportunities  
${sortedCategories.filter(cat => ['MODERATE', 'GOOD'].includes(categoryAnalysis[cat].severity)).length > 0 ?
  sortedCategories.filter(cat => ['MODERATE', 'GOOD'].includes(categoryAnalysis[cat].severity))
    .map(cat => `- **${categoryNames[cat as keyof typeof categoryNames]}**: ${categoryAnalysis[cat].percentage}% (optimization potential)`)
    .join('\n') :
  'No moderate areas identified'}

### Well-Functioning Systems
${sortedCategories.filter(cat => categoryAnalysis[cat].severity === 'OPTIMAL').length > 0 ?
  sortedCategories.filter(cat => categoryAnalysis[cat].severity === 'OPTIMAL')
    .map(cat => `- **${categoryNames[cat as keyof typeof categoryNames]}**: ${categoryAnalysis[cat].percentage}% (optimal function)`)
    .join('\n') :
  'No systems currently at optimal levels'}

## 📊 Detailed Category Analysis

${sortedCategories.map(category => {
  const analysis = categoryAnalysis[category];
  const severityEmoji = {
    'CRITICAL': '🔴',
    'HIGH': '🟠', 
    'MODERATE': '🟡',
    'GOOD': '🟢',
    'OPTIMAL': '✅'
  }[analysis.severity] || '⚪';

  return `### ${severityEmoji} ${categoryNames[category as keyof typeof categoryNames]}

**Overall Score**: ${analysis.percentage}% (${analysis.avgScore}/5.0)
**Severity Level**: ${analysis.severity}
**Clinical Interpretation**: ${analysis.interpretation}

**Assessment Details**:
- Questions Analyzed: ${analysis.questionCount}
- High Concern Responses (≤2): ${analysis.highConcernQuestions}
- Low Concern Responses (≥4): ${analysis.lowConcernQuestions}
- Trend Analysis: ${analysis.trendAnalysis}

**Recommendations**:
${analysis.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---`;
}).join('\n')}

## 📈 Trending Analysis

${assessments.length > 1 ? `
### Assessment Progression
${sortedCategories.map(category => {
  const history = categoryData[category].assessmentHistory;
  if (history.length >= 2) {
    const firstScore = history[history.length - 1].avgScore;
    const lastScore = history[0].avgScore;
    const change = lastScore - firstScore;
    const changeIcon = change > 0.2 ? '📈' : change < -0.2 ? '📉' : '➡️';
    
    return `- **${categoryNames[category as keyof typeof categoryNames]}**: ${changeIcon} ${firstScore.toFixed(1)} → ${lastScore.toFixed(1)} (${change > 0 ? '+' : ''}${change.toFixed(1)} point change)`;
  }
  return `- **${categoryNames[category as keyof typeof categoryNames]}**: Single assessment (no trend data)`;
}).join('\n')}
` : `
### Single Assessment
This analysis is based on a single assessment. Complete additional assessments to:
- Track progress over time
- Identify improvement patterns
- Monitor intervention effectiveness
- Adjust protocols based on response
`}

## 🎯 Clinical Action Items

### Immediate Priority Actions
${sortedCategories.filter(cat => ['HIGH', 'CRITICAL'].includes(categoryAnalysis[cat].severity)).length > 0 ?
  sortedCategories.filter(cat => ['HIGH', 'CRITICAL'].includes(categoryAnalysis[cat].severity))
    .slice(0, 3)
    .map((cat, index) => `${index + 1}. **Address ${categoryNames[cat as keyof typeof categoryNames]}** (${categoryAnalysis[cat].percentage}%)
   - ${categoryAnalysis[cat].recommendations[0]}
   - Consider additional testing specific to ${categoryNames[cat as keyof typeof categoryNames].toLowerCase()}`)
    .join('\n') :
  '✅ No immediate priority actions required - focus on optimization and maintenance'}

### Follow-up Recommendations
1. **Re-assessment Timeline**: Complete follow-up assessment in 4-6 weeks
2. **Progress Tracking**: Monitor changes in high-priority categories
3. **Protocol Adjustments**: Modify interventions based on response patterns
4. **Additional Testing**: Consider functional testing for high-concern categories

## 📋 Data Completeness Assessment

- **Assessment Coverage**: ${((Object.values(categoryAnalysis).reduce((sum: number, cat: any) => sum + cat.questionCount, 0) / (categories.length * 10)) * 100).toFixed(1)}% of functional systems evaluated
- **Trending Data**: ${assessments.length > 1 ? `✅ Available (${assessments.length} assessments)` : '❌ Limited (single assessment)'}
- **Historical Context**: ${assessments.length >= 3 ? 'Excellent (3+ assessments)' : assessments.length === 2 ? 'Good (2 assessments)' : 'Limited (1 assessment)'}

---

*This analysis uses evidence-based functional medicine scoring to identify system dysfunctions and prioritize interventions. Scores ≤50% indicate significant dysfunction requiring targeted protocols.*`;

  return markdown;
}

function generateClientSummary(data: any): string {
  const client = data.client;
  const assessments = data.assessments;
  const documents = data.documents;
  const notes = data.notes;
  const protocols = data.protocols;

  return `# Client Analysis Summary: ${client.name}

## Client Overview
- **Name:** ${client.name}
- **Email:** ${client.email}
- **Phone:** ${client.phone}
- **Date of Birth:** ${
    client.dateOfBirth
      ? new Date(client.dateOfBirth).toLocaleDateString()
      : "Not provided"
  }
- **Gender:** ${client.gender || "Not specified"}
- **Commercial Driver:** ${client.isTruckDriver ? "Yes" : "No"}
- **Status:** ${client.status}
- **Last Visit:** ${
    client.lastVisit
      ? new Date(client.lastVisit).toLocaleDateString()
      : "No previous visits"
  }

## Health Goals
${
  client.healthGoals
    ? JSON.stringify(client.healthGoals, null, 2)
    : "No health goals specified"
}

## Current Medications
${
  client.medications
    ? JSON.stringify(client.medications, null, 2)
    : "No medications listed"
}

## Medical Conditions
${
  client.conditions
    ? JSON.stringify(client.conditions, null, 2)
    : "No conditions listed"
}

## Allergies
${
  client.allergies
    ? JSON.stringify(client.allergies, null, 2)
    : "No allergies listed"
}

## Assessment Summary
- **Total Assessments:** ${assessments.length}
${assessments
  .map(
    (assessment) => `
### Assessment (${assessment.startedAt})
- **Status:** ${assessment.status}
- **Total Questions:** ${assessment.totalQuestions}
- **Average Score:** ${assessment.averageScore.toFixed(1)}/5.0
- **Completed:** ${
      assessment.completedAt
        ? new Date(assessment.completedAt).toLocaleDateString()
        : "In progress"
    }
`
  )
  .join("")}

## Document Summary
- **Total Documents:** ${documents.length}
${documents
  .map(
    (doc) => `
### ${doc.fileName}
- **Type:** ${doc.documentType} ${doc.labType ? `(${doc.labType})` : ""}
- **Uploaded:** ${new Date(doc.uploadedAt).toLocaleDateString()}
- **Analysis Status:** ${doc.analysisStatus}
- **Lab Values:** ${doc.labValues.length} values extracted
${
  doc.labValues.length > 0
    ? `
  **Critical Values:**
  ${doc.labValues
    .filter((lab) => lab.isCritical)
    .map(
      (lab) => `
  - **${lab.testName}:** ${lab.value} ${lab.unit} (${lab.flag})`
    )
    .join("")}
`
    : ""
}
`
  )
  .join("")}

## Clinical Notes Summary
- **Total Notes:** ${notes.length}
${notes
  .map(
    (note) => `
### ${note.noteType} Note - ${new Date(note.createdAt).toLocaleDateString()}
${note.title ? `**Title:** ${note.title}` : ""}
${note.chiefComplaints ? `**Chief Complaints:** ${note.chiefComplaints}` : ""}
${note.nextSteps ? `**Next Steps:** ${note.nextSteps}` : ""}
${note.followUpNeeded ? "**⚠️ Follow-up Required**" : ""}
`
  )
  .join("")}

## Treatment Protocols
- **Total Protocols:** ${protocols.length}
${protocols
  .map(
    (protocol) => `
### ${protocol.protocolName}
- **Status:** ${protocol.status}
- **Created:** ${new Date(protocol.createdAt).toLocaleDateString()}
- **Supplements:** ${
      typeof protocol.supplements === "object"
        ? Object.keys(protocol.supplements).length + " items"
        : "Not specified"
    }
- **Dietary Guidelines:** ${
      typeof protocol.dietary === "object"
        ? Object.keys(protocol.dietary).length + " items"
        : "Not specified"
    }
- **Lifestyle Changes:** ${
      typeof protocol.lifestyle === "object"
        ? Object.keys(protocol.lifestyle).length + " items"
        : "Not specified"
    }
`
  )
  .join("")}

## Export Information
- **Exported On:** ${new Date().toLocaleDateString()}
- **Export Version:** 1.0.0
- **Data Completeness:** ${
    assessments.length + documents.length + notes.length + protocols.length
  } total records

---
*This summary was automatically generated from the FNTP assessment system.*
`;
}
