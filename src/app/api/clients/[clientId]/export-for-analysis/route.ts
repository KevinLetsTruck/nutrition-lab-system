import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { medicalDocStorage } from "@/lib/medical/storage-service";

// Claude Desktop Analysis System directory
const CLAUDE_ANALYSIS_DIR = "/Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports";

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

    // Create Claude Desktop directory if it doesn't exist
    try {
      if (!fs.existsSync(CLAUDE_ANALYSIS_DIR)) {
        fs.mkdirSync(CLAUDE_ANALYSIS_DIR, { recursive: true });
        console.log(`📁 Created Claude Analysis directory: ${CLAUDE_ANALYSIS_DIR}`);
      }
    } catch (dirError) {
      console.error("❌ Failed to create Claude Analysis directory:", dirError);
      return NextResponse.json({
        error: "Failed to access Claude Analysis System directory",
        details: "Please ensure /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/ is accessible",
        requiredPath: CLAUDE_ANALYSIS_DIR
      }, { status: 500 });
    }

    // Fetch complete client data from current database tables
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
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
        dateOfBirth: clientData.dateOfBirth ? clientData.dateOfBirth.toISOString().split('T')[0] : null,
        gender: clientData.gender || "",
        healthGoals: Array.isArray(clientData.healthGoals) ? clientData.healthGoals : 
                    (clientData.healthGoals ? [String(clientData.healthGoals)] : []),
        medications: Array.isArray(clientData.medications) ? clientData.medications : 
                    (clientData.medications ? [String(clientData.medications)] : []),
        conditions: Array.isArray(clientData.conditions) ? clientData.conditions : 
                   (clientData.conditions ? [String(clientData.conditions)] : []),
        allergies: Array.isArray(clientData.allergies) ? clientData.allergies : 
                  (clientData.allergies ? [String(clientData.allergies)] : [])
      },
      assessments: [], // No assessment data in current schema
      documents: clientData.documents.map((doc) => ({
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
          status: lab.flag || (lab.isOutOfRange ? "ABNORMAL" : "NORMAL")
        }))
      })),
      notes: clientData.notes.map((note) => ({
        id: note.id,
        noteType: note.noteType,
        title: note.title || "",
        chiefComplaints: note.chiefComplaints || "",
        healthHistory: note.healthHistory || "",
        goals: note.goals || "",
        createdAt: note.createdAt.toISOString()
      })),
      protocols: clientData.protocols.map((protocol) => ({
        id: protocol.id,
        protocolName: protocol.protocolName || "",
        status: protocol.status || "",
        supplements: protocol.supplements || {},
        dietary: protocol.dietary || {},
        lifestyle: protocol.lifestyle || {},
        createdAt: protocol.createdAt.toISOString()
      }))
    };

    // Create export metadata for Claude
    const exportMetadata = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      clientId: clientData.id,
      systemVersion: "v2.2.0-export-system-stable-claude-ready"
    };

    // Generate client summary for Claude
    const clientSummary = generateClaudeCompatibleSummary(claudeExportData);

    // Create ZIP file and save to Claude Analysis System
    return new Promise(async (resolve) => {
      const archive = archiver("zip", { zlib: { level: 9 } });
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
            summary: {
              clientName: `${clientData.firstName} ${clientData.lastName}`,
              totalDocuments: clientData.documents.length,
              totalNotes: clientData.notes.length,
              totalProtocols: clientData.protocols.length,
              exportedFiles: [
                "client-data.json",
                "client-summary.md",
                "export-metadata.json",
                `${clientData.documents.length} PDF documents`
              ]
            }
          })
        );
      });

      output.on("error", (err) => {
        console.error("❌ File system error:", err);
        resolve(
          NextResponse.json({
            error: "Failed to save export to Claude Analysis System",
            details: `File system error: ${err.message}`,
            location: CLAUDE_ANALYSIS_DIR,
            troubleshooting: [
              "Check directory permissions",
              "Ensure sufficient disk space",
              "Verify path accessibility"
            ]
          }, { status: 500 })
        );
      });

      archive.on("error", (err) => {
        console.error("❌ Archive error:", err);
        resolve(
          NextResponse.json({
            error: "Failed to create export archive",
            details: err.message
          }, { status: 500 })
        );
      });

      archive.pipe(output);

      // Add Claude-compatible JSON files to ZIP
      archive.append(JSON.stringify(claudeExportData, null, 2), {
        name: "client-data.json",
      });

      archive.append(clientSummary, { 
        name: "client-summary.md" 
      });

      archive.append(JSON.stringify(exportMetadata, null, 2), {
        name: "export-metadata.json",
      });

      // Add document files (if they exist)
      let copiedDocuments = 0;
      const skippedDocuments = [];
      console.log(`🔍 Processing ${clientData.documents.length} documents for Claude export...`);

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

      // Finalize the archive
      archive.finalize();
    });
  } catch (error) {
    console.error("❌ Claude export error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Export failed",
      details: "Failed to export client data to Claude Analysis System",
      location: CLAUDE_ANALYSIS_DIR
    }, { status: 500 });
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
