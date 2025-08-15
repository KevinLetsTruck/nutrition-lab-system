#!/usr/bin/env node

const {
  documentProcessingWorker,
} = require("./src/lib/medical/processing-worker");

async function triggerProcessing() {
  const documentId = "cmebfpm450004v2ehv6mg40es"; // The latest pending document

  console.log(`🚀 Manually triggering processing for document: ${documentId}`);

  try {
    await documentProcessingWorker.addToQueue({
      documentId: documentId,
      priority: 10,
      isRadioShow: false,
    });

    console.log("✅ Document added to processing queue");
    console.log("⏳ Check the monitor dashboard to see processing updates");
  } catch (error) {
    console.error("❌ Error triggering processing:", error.message);
  }
}

triggerProcessing();
