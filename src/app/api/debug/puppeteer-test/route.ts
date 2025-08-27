import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { ClaudeDesktopAutomation } from "@/lib/ai/claude-desktop-automation";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🧪 Starting Puppeteer debug test...");

    // Create a simple test file
    const tempDir = os.tmpdir();
    const testFilePath = path.join(tempDir, `test-${Date.now()}.txt`);
    fs.writeFileSync(testFilePath, "This is a test file for Puppeteer automation debugging.");

    console.log(`📁 Test file created: ${testFilePath}`);

    // Test Puppeteer automation with very basic setup
    const automation = new ClaudeDesktopAutomation({
      headless: false, // Always visible for debugging
      timeout: 30000, // Shorter timeout for testing
    });

    console.log("🤖 Testing browser initialization...");
    await automation.initialize();
    console.log("✅ Browser initialized successfully");

    console.log("🌐 Testing navigation to Claude.ai...");
    await automation.navigateToClaude();
    console.log("✅ Navigation successful");

    console.log("🔑 Testing authentication check...");
    await automation.handleAuthentication();
    console.log("✅ Authentication check passed");

    // Don't actually try to upload or analyze, just test the setup
    console.log("🧹 Cleaning up test...");
    await automation.cleanup();
    
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    return NextResponse.json({
      success: true,
      message: "Puppeteer debug test completed successfully",
      tests: {
        browserInit: "✅ Passed",
        navigation: "✅ Passed", 
        authentication: "✅ Passed"
      }
    });

  } catch (error) {
    console.error("❌ Puppeteer debug test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
      debugInfo: "Check Railway logs for detailed Puppeteer output"
    }, { status: 500 });
  }
}
