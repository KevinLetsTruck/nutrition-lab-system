import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    // Fetch complete client data from all main tables
    const clientData = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        // Assessment data
        FunctionalMedicineAssessment: {
          orderBy: { createdAt: "desc" },
        },
        // Document data with analysis
        Document: {
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

    // Create export directory structure (server-side for processing)
    const clientName = `${clientData.firstName}-${clientData.lastName}`;
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const folderName = `${clientName}-${timestamp}`;
    
    // Use server temp directory for processing
    const tempDir = path.join(process.cwd(), "temp-exports");
    const clientExportDir = path.join(tempDir, folderName);
    const documentsDir = path.join(clientExportDir, "documents");

    // Ensure directories exist
    fs.mkdirSync(clientExportDir, { recursive: true });
    fs.mkdirSync(documentsDir, { recursive: true });

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
      assessments: clientData.FunctionalMedicineAssessment.map(
        (assessment) => ({
          id: assessment.id,
          status: assessment.status || "completed",
          startedAt: assessment.createdAt,
          completedAt: assessment.updatedAt,
          totalQuestions: assessment.totalQuestions || 0,
          averageScore: assessment.averageScore || 0,
          systemScores: assessment.systemScores || {},
          recommendations: assessment.recommendations || {},
        })
      ),
      documents: (clientData.Document || []).map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt,
        extractedText: doc.extractedText,
        aiAnalysis: doc.aiAnalysis,
        documentType: doc.documentType,
        labType: doc.documentType, // Use documentType as labType for compatibility
        analysisStatus: doc.processingStatus || "completed",
        fileUrl: doc.fileUrl,
        storageProvider: doc.storageProvider,
        processingStatus: doc.processingStatus,
        labValues: [], // Empty array for compatibility with summary function
      })),
      notes: (clientData.Note || []).map((note) => ({
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
      protocols: (clientData.Protocol || []).map((protocol) => ({
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
        totalAssessments: (clientData.FunctionalMedicineAssessment || [])
          .length,
        totalDocuments: (clientData.Document || []).length,
        totalNotes: (clientData.Note || []).length,
        totalProtocols: (clientData.Protocol || []).length,
      },
    };

    // Create ZIP archive that downloads with folder structure
    return new Promise(async (resolve) => {
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on("data", (chunk) => chunks.push(chunk));
      archive.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const response = new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${folderName}.zip"`,
            "Content-Length": buffer.length.toString(),
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

      // Add files to ZIP with folder structure
      const summaryContent = generateClientSummary(exportData);
      
      // Add files inside the folder structure
      archive.append(JSON.stringify(exportData, null, 2), { 
        name: `${folderName}/client-data.json` 
      });
      archive.append(summaryContent, { 
        name: `${folderName}/client-summary.md` 
      });
      archive.append(JSON.stringify(exportData.exportMetadata, null, 2), { 
        name: `${folderName}/export-metadata.json` 
      });

      // Copy document files into documents/ subfolder
      let copiedDocuments = 0;
      let documentsSkipped = 0;
      
      for (const doc of clientData.Document || []) {
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
              archive.file(sourcePath, { 
                name: `${folderName}/documents/${fileName}` 
              });
              copiedDocuments++;
              continue;
            } else {
              console.warn(`❌ Local file not found: ${sourcePath}`);
            }
          }

          // If LOCAL failed or storage is S3, try S3 download
          if (doc.storageProvider === "S3" && doc.fileUrl.startsWith("http")) {
            try {
              console.log(`☁️ Downloading from S3: ${doc.fileUrl}`);
              const response = await fetch(doc.fileUrl);
              
              if (response.ok) {
                fileBuffer = Buffer.from(await response.arrayBuffer());
                console.log(`✅ S3 file downloaded: ${fileName} (${fileBuffer.length} bytes)`);
                
                archive.append(fileBuffer, { 
                  name: `${folderName}/documents/${fileName}` 
                });
                copiedDocuments++;
                continue;
              } else {
                console.warn(`❌ S3 download failed: ${response.status} ${response.statusText}`);
              }
            } catch (s3Error) {
              console.error(`❌ S3 download error for ${fileName}:`, s3Error);
            }
          }

          // If we get here, the document couldn't be retrieved
          console.warn(`⚠️ Document not accessible: ${fileName}`);
          documentsSkipped++;
          
        } catch (error) {
          console.error(`❌ Failed to process document ${doc.fileName}:`, error);
          documentsSkipped++;
        }
      }

      console.log(`📊 Documents processed: ${copiedDocuments} copied, ${documentsSkipped} skipped`);

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

function generateClientSummary(data: any): string {
  const client = data.client;
  const assessments = data.assessments || [];
  const documents = data.documents || [];
  const notes = data.notes || [];
  const protocols = data.protocols || [];

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
- **Lab Values:** ${(doc.labValues || []).length} values extracted
${
  (doc.labValues || []).length > 0
    ? `
  **Critical Values:**
  ${(doc.labValues || [])
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
