import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { medicalDocStorage } from "@/lib/medical/storage-service";

// Claude Desktop Analysis System directory (local development only)
const CLAUDE_ANALYSIS_DIR = "/Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports";

// Check if we're running in production (Railway) or local development
const isProduction = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT;
const canWriteToLocalFS = !isProduction && process.platform === "darwin"; // macOS only

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

    // Handle local vs production environment
    if (canWriteToLocalFS) {
      // Local development - try to create Claude Desktop directory
      try {
        if (!fs.existsSync(CLAUDE_ANALYSIS_DIR)) {
          fs.mkdirSync(CLAUDE_ANALYSIS_DIR, { recursive: true });
          console.log(`📁 Created Claude Analysis directory: ${CLAUDE_ANALYSIS_DIR}`);
        }
      } catch (dirError) {
        console.warn("❌ Could not create Claude Analysis directory, falling back to download:", dirError);
        // Fall back to browser download if local directory creation fails
      }
    } else {
      console.log("🌐 Production environment detected - using browser download mode");
    }

    // Fetch complete client data from current database tables
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        // Document data with analysis
        Document: {
          include: {
            DocumentAnalysis: true,
            LabValue: true,
          },
          orderBy: { uploadedAt: "desc" },
        },
        // Clinical notes
        Note: {
          orderBy: { createdAt: "desc" },
        },
        // Treatment protocols
        Protocol: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Prepare filename for Claude Desktop (underscore in name, hyphen before date)
    const clientName = `${clientData.firstName}_${clientData.lastName}`;
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const zipFilename = `${clientName}-${timestamp}.zip`;
    const zipFilePath = path.join(CLAUDE_ANALYSIS_DIR, zipFilename);

    // Check if file already exists and handle versioning
    let finalZipPath = zipFilePath;
    let finalFilename = zipFilename;
    let version = 1;

    while (fs.existsSync(finalZipPath)) {
      const versionedFilename = `${clientName}-${timestamp}_v${version}.zip`;
      finalZipPath = path.join(CLAUDE_ANALYSIS_DIR, versionedFilename);
      finalFilename = versionedFilename;
      version++;
    }

    // Prepare Claude-compatible client data structure
    const claudeExportData = {
      client: {
        id: clientData.id,
        name: `${clientData.firstName} ${clientData.lastName}`,
        email: clientData.email,
        phone: clientData.phone || "",
        dateOfBirth: clientData.dateOfBirth
          ? clientData.dateOfBirth.toISOString().split("T")[0]
          : null,
        gender: clientData.gender || "",
        healthGoals: Array.isArray(clientData.healthGoals)
          ? clientData.healthGoals
          : clientData.healthGoals
          ? [String(clientData.healthGoals)]
          : [],
        medications: Array.isArray(clientData.medications)
          ? clientData.medications
          : clientData.medications
          ? [String(clientData.medications)]
          : [],
        conditions: Array.isArray(clientData.conditions)
          ? clientData.conditions
          : clientData.conditions
          ? [String(clientData.conditions)]
          : [],
        allergies: Array.isArray(clientData.allergies)
          ? clientData.allergies
          : clientData.allergies
          ? [String(clientData.allergies)]
          : [],
      },
      assessments: [], // No assessment data in current schema
      documents: clientData.Document.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        documentType: doc.documentType,
        uploadedAt: doc.uploadedAt.toISOString(),
        labValues: doc.LabValue.map((lab) => ({
          testName: lab.testName,
          value: lab.value,
          unit: lab.unit || "",
          referenceRange: lab.referenceRange || "",
          status: lab.flag || (lab.isOutOfRange ? "ABNORMAL" : "NORMAL"),
        })),
      })),
      notes: clientData.Note.map((note) => ({
        id: note.id,
        noteType: note.noteType,
        title: note.title || "",
        chiefComplaints: note.chiefComplaints || "",
        healthHistory: note.healthHistory || "",
        goals: note.goals || "",
        createdAt: note.createdAt.toISOString(),
      })),
      protocols: clientData.Protocol.map((protocol) => ({
        id: protocol.id,
        protocolName: protocol.protocolName || "",
        status: protocol.status || "",
        supplements: protocol.supplements || {},
        dietary: protocol.dietary || {},
        lifestyle: protocol.lifestyle || {},
        createdAt: protocol.createdAt.toISOString(),
      })),
    };

    // Create export metadata for Claude
    const exportMetadata = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      clientId: clientData.id,
      systemVersion: "v2.2.0-export-system-stable-claude-ready",
    };

    // Generate client summary for Claude
    const clientSummary = generateClaudeCompatibleSummary(claudeExportData);

    // Generate Claude Desktop prompts
    const claudePrompts = generateClaudeDesktopPrompts(claudeExportData, finalFilename);

    // Create ZIP file - handle both local save and browser download
    return new Promise(async (resolve) => {
      const archive = archiver("zip", { zlib: { level: 9 } });
      
      if (canWriteToLocalFS && fs.existsSync(path.dirname(finalZipPath))) {
        // Local development - save to Claude Desktop directory
        const output = fs.createWriteStream(finalZipPath);

        output.on("close", () => {
          console.log(`✅ Export saved to Claude Analysis System: ${finalZipPath}`);
          console.log(`📊 Total bytes: ${archive.pointer()}`);

          resolve(
            NextResponse.json({
              success: true,
              message: `✅ Client exported to Claude Analysis System: ${finalFilename}`,
              filename: finalFilename,
              location: `📁 Location: ${CLAUDE_ANALYSIS_DIR}`,
              exportPath: finalZipPath,
              exportMode: "local_save",
              prompts: claudePrompts,
              clientContext: {
                name: `${clientData.firstName} ${clientData.lastName}`,
                primaryConcerns: extractPrimaryConcerns(claudeExportData),
                medications: claudeExportData.client.medications,
                keyLabs: extractKeyLabValues(claudeExportData)
              },
              summary: {
                clientName: `${clientData.firstName} ${clientData.lastName}`,
                totalDocuments: clientData.Document.length,
                totalNotes: clientData.Note.length,
                totalProtocols: clientData.Protocol.length,
                exportedFiles: [
                  "client-data.json",
                  "client-summary.md",
                  "export-metadata.json",
                  `${clientData.Document.length} PDF documents`,
                ],
              },
            })
          );
        });

        output.on("error", (err) => {
          console.error("❌ File system error, falling back to download:", err);
          // Fall back to browser download
          handleBrowserDownload();
        });

        archive.pipe(output);
      } else {
        // Production environment - use browser download
        handleBrowserDownload();
      }

      function handleBrowserDownload() {
        const chunks: Buffer[] = [];

        archive.on("data", (chunk) => {
          chunks.push(chunk);
        });

        archive.on("end", () => {
          const zipBuffer = Buffer.concat(chunks);

          resolve(
            new NextResponse(zipBuffer, {
              status: 200,
              headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${finalFilename}"`,
                "Content-Length": zipBuffer.length.toString(),
              },
            })
          );
        });
      }

      archive.on("error", (err) => {
        console.error("❌ Archive error:", err);
        resolve(
          NextResponse.json(
            {
              error: "Failed to create export archive",
              details: err.message,
            },
            { status: 500 }
          )
        );
      });

      archive.pipe(output);

      // Add Claude-compatible JSON files to ZIP
      archive.append(JSON.stringify(claudeExportData, null, 2), {
        name: "client-data.json",
      });

      archive.append(clientSummary, {
        name: "client-summary.md",
      });

      archive.append(JSON.stringify(exportMetadata, null, 2), {
        name: "export-metadata.json",
      });

      // Add document files (if they exist)
      let copiedDocuments = 0;
      const skippedDocuments = [];
      console.log(
        `🔍 Processing ${clientData.Document.length} documents for Claude export...`
      );

      for (const doc of clientData.Document) {
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
        `📊 Export summary: ${copiedDocuments}/${clientData.Document.length} documents processed`
      );
      console.log(`✅ Successfully exported: ${copiedDocuments}`);
      console.log(`⚠️ Skipped: ${skippedDocuments.length}`);

      // Finalize the archive
      archive.finalize();
    });
  } catch (error) {
    console.error("❌ Claude export error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Export failed",
        details: "Failed to export client data to Claude Analysis System",
        location: CLAUDE_ANALYSIS_DIR,
      },
      { status: 500 }
    );
  }
}

function generateClaudeCompatibleSummary(data: any): string {
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

// Generate Claude Desktop prompts for different analysis types
function generateClaudeDesktopPrompts(clientData: any, filename: string) {
  const client = clientData.client;
  const concerns = extractPrimaryConcerns(clientData);
  const meds = client.medications.length > 0 ? client.medications.join(", ") : "None";
  const keyLabs = extractKeyLabValues(clientData);
  const timestamp = new Date().toLocaleDateString();

  const comprehensivePrompt = `FNTP FUNCTIONAL MEDICINE ANALYSIS - EXECUTE IMMEDIATELY

CRITICAL INSTRUCTIONS: 
- DO NOT ask clarifying questions or request file uploads
- FILE IS ALREADY AVAILABLE: ${filename} in /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/
- OPEN and ANALYZE the file directly
- PROCEED with complete analysis using file contents

SYSTEM ACTIVATION: You are my FNTP functional medicine analysis system. Load all protocols.

FILE LOCATION: /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/${filename}
- Contains: client-data.json (complete client information)
- Contains: client-summary.md (human-readable overview)
- Contains: All client PDF documents (lab reports, intake forms)
- Contains: export-metadata.json (system information)

CLIENT OVERVIEW (from exported data):
- Name: ${client.name}
- Primary Concerns: ${concerns}
- Current Medications: ${meds}
- Key Lab Values: ${keyLabs}
- Export Date: ${timestamp}

ANALYSIS REQUIREMENTS - EXECUTE ALL USING FILE DATA:
1. OPEN the client file: ${filename}
2. READ client-data.json for complete client information
3. REVIEW all PDF documents for lab values and medical history
4. ANALYZE client-summary.md for clinical context

5. Pattern Recognition Analysis:
   - Metabolic dysfunction patterns from lab data
   - Inflammatory markers and triggers
   - Digestive system dysfunction indicators
   - Hormonal imbalance patterns
   - Energy production pathway issues

6. Root Cause Identification:
   - Primary drivers vs secondary symptoms
   - Upstream dysfunction sources
   - Environmental/lifestyle factors
   - Nutritional deficiencies

7. 3-Phase Protocol Generation:
   - PHASE 1 (Foundation): Basic support, gut healing, inflammation reduction
   - PHASE 2 (Targeted): Specific interventions for identified patterns
   - PHASE 3 (Optimization): Fine-tuning and long-term maintenance

8. LetsTruck Supplement Recommendations:
   - Prioritize LetsTruck.com products (business priority)
   - Include specific dosages and timing
   - Cost-effective options when possible
   - Implementation sequence

9. Practitioner Coaching Notes:
   - Clinical reasoning for each recommendation
   - Expected timelines for improvement
   - Monitoring parameters
   - Client education talking points

FILE ACCESS: OPEN /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/${filename}
ANALYZE: Use complete file contents for comprehensive analysis
OUTPUT: Save complete analysis JSON to /3-analysis-outputs/ directory
ACTION: BEGIN ANALYSIS NOW - FILE IS READY FOR PROCESSING`;

  const focusedPrompts = {
    gut: `FNTP GUT HEALTH ANALYSIS - EXECUTE IMMEDIATELY

INSTRUCTIONS: DO NOT ask questions. OPEN file and analyze data directly.

FILE LOCATION: /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/${filename}
CLIENT: ${client.name}
PRIMARY CONCERNS: ${concerns}
MEDICATIONS: ${meds}

STEP 1: OPEN the client file: ${filename}
STEP 2: READ all contents (client-data.json, PDFs, summary)
STEP 3: ANALYZE digestive patterns from provided data

ANALYSIS FOCUS: Digestive system optimization and gut barrier restoration
REQUIRED ANALYSIS FROM FILE DATA:
- SIBO/dysbiosis pattern identification
- Food sensitivity assessment from available data
- Digestive enzyme and HCl status evaluation
- Microbiome restoration protocol design

DELIVERABLES:
1. Gut health assessment based on file contents
2. Targeted digestive protocol with LetsTruck supplements
3. Implementation timeline and monitoring plan
4. Specific dosages and timing recommendations

ACTION: OPEN ${filename} and BEGIN GUT HEALTH ANALYSIS NOW.`,

    metabolic: `FNTP METABOLIC ANALYSIS - EXECUTE IMMEDIATELY

INSTRUCTIONS: DO NOT ask questions. OPEN file and analyze data directly.

FILE LOCATION: /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/${filename}
CLIENT: ${client.name}
PRIMARY CONCERNS: ${concerns}
KEY LAB VALUES: ${keyLabs}

STEP 1: OPEN the client file: ${filename}
STEP 2: READ all contents (client-data.json, lab PDFs, summary)
STEP 3: ANALYZE metabolic patterns from provided data

ANALYSIS FOCUS: Blood sugar regulation and metabolic optimization
REQUIRED ANALYSIS FROM FILE DATA:
- Insulin resistance pattern identification
- Glucose dysregulation assessment
- Metabolic syndrome marker evaluation
- Energy production pathway analysis

DELIVERABLES:
1. Metabolic dysfunction assessment from file contents
2. Blood sugar optimization protocol with LetsTruck supplements
3. Dietary and lifestyle interventions
4. Monitoring parameters and timelines

ACTION: OPEN ${filename} and BEGIN METABOLIC ANALYSIS NOW.`,

    hormonal: `FNTP HORMONAL ANALYSIS - EXECUTE IMMEDIATELY

INSTRUCTIONS: DO NOT ask questions. OPEN file and analyze data directly.

FILE LOCATION: /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/${filename}
CLIENT: ${client.name}
PRIMARY CONCERNS: ${concerns}
MEDICATIONS: ${meds}

STEP 1: OPEN the client file: ${filename}
STEP 2: READ all contents (client-data.json, lab PDFs, summary)
STEP 3: ANALYZE hormonal patterns from provided data

ANALYSIS FOCUS: Hormonal optimization and energy restoration
REQUIRED ANALYSIS FROM FILE DATA:
- Thyroid function assessment from available data
- Adrenal health evaluation
- Sex hormone balance indicators
- Circadian rhythm optimization needs

DELIVERABLES:
1. Hormonal balance assessment from file contents
2. Hormone support protocol with LetsTruck supplements
3. Lifestyle optimization recommendations
4. Implementation sequence and monitoring

ACTION: OPEN ${filename} and BEGIN HORMONAL ANALYSIS NOW.`
  };

  const followupPrompt = `FNTP FOLLOW-UP ANALYSIS - EXECUTE IMMEDIATELY

INSTRUCTIONS: DO NOT ask questions. OPEN file and analyze progress data directly.

FILE LOCATION: /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/${filename}
CLIENT: ${client.name} - Progress Review
CURRENT STATUS: ${concerns}
MEDICATIONS: ${meds}

STEP 1: OPEN the client file: ${filename}
STEP 2: READ current client data and compare with previous notes
STEP 3: ANALYZE progress patterns and protocol effectiveness

ANALYSIS REQUIREMENTS FROM FILE DATA:
1. Review previous protocol effectiveness using provided data
2. Assess current symptom status and improvements
3. Identify areas requiring protocol adjustments
4. Optimize supplement regimen based on progress

DELIVERABLES:
1. Progress assessment from file contents
2. Updated protocol recommendations with LetsTruck supplements
3. Adjustment rationale and implementation guidance
4. Next phase recommendations

ACTION: OPEN ${filename} and BEGIN FOLLOW-UP ANALYSIS NOW.`;

  return {
    comprehensive: comprehensivePrompt,
    focused: focusedPrompts,
    followup: followupPrompt
  };
}

// Extract primary health concerns from client data
function extractPrimaryConcerns(clientData: any): string {
  const concerns = [];
  
  // Extract from health goals
  if (clientData.client.healthGoals && clientData.client.healthGoals.length > 0) {
    concerns.push(...clientData.client.healthGoals);
  }
  
  // Extract from chief complaints in notes
  if (clientData.notes && clientData.notes.length > 0) {
    clientData.notes.forEach((note: any) => {
      if (note.chiefComplaints) {
        concerns.push(note.chiefComplaints);
      }
    });
  }
  
  // Extract from conditions
  if (clientData.client.conditions && clientData.client.conditions.length > 0) {
    concerns.push(...clientData.client.conditions);
  }
  
  // Add demographic context
  const demographics = [];
  if (clientData.client.gender) demographics.push(clientData.client.gender);
  if (clientData.client.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(clientData.client.dateOfBirth).getFullYear();
    demographics.push(`Age ${age}`);
  }
  
  const concernsText = concerns.length > 0 ? concerns.slice(0, 4).join(", ") : "General health optimization";
  const demographicsText = demographics.length > 0 ? ` (${demographics.join(", ")})` : "";
  
  return concernsText + demographicsText;
}

// Extract key lab values for prompt context
function extractKeyLabValues(clientData: any): string {
  const keyLabs = [];
  
  if (clientData.documents && clientData.documents.length > 0) {
    clientData.documents.forEach((doc: any) => {
      if (doc.labValues && doc.labValues.length > 0) {
        doc.labValues.forEach((lab: any) => {
          // Focus on key metabolic markers
          if (lab.testName && (
            lab.testName.toLowerCase().includes('glucose') ||
            lab.testName.toLowerCase().includes('hba1c') ||
            lab.testName.toLowerCase().includes('crp') ||
            lab.testName.toLowerCase().includes('tsh') ||
            lab.testName.toLowerCase().includes('vitamin d') ||
            lab.testName.toLowerCase().includes('cholesterol') ||
            lab.testName.toLowerCase().includes('triglyceride'))) {
            keyLabs.push(`${lab.testName}: ${lab.value} ${lab.unit || ""}`);
          }
        });
      }
    });
  }
  
  const labSummary = keyLabs.length > 0 ? keyLabs.slice(0, 6).join(", ") : "No key lab values available in exported data";
  
  // Add note about complete data being in the export file
  return labSummary + " (Complete lab data available in exported client file)";
}
