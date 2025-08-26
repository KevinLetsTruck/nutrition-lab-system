#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("\n🔧 Enabling Essential Questions Mode\n");

const envPath = path.join(__dirname, "..", ".env.local");
const envLine = "NEXT_PUBLIC_ESSENTIAL_MODE=true";

try {
  // Check if .env.local exists
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
    console.log("📄 Found existing .env.local file");
  } else {
    console.log("📄 Creating new .env.local file");
  }

  // Check if the variable is already set
  if (content.includes("NEXT_PUBLIC_ESSENTIAL_MODE")) {
    // Update existing value
    content = content.replace(/NEXT_PUBLIC_ESSENTIAL_MODE=.*/g, envLine);
    console.log("✏️  Updated existing NEXT_PUBLIC_ESSENTIAL_MODE to true");
  } else {
    // Add new line
    if (content && !content.endsWith("\n")) {
      content += "\n";
    }
    content += envLine + "\n";
    console.log("➕ Added NEXT_PUBLIC_ESSENTIAL_MODE=true");
  }

  // Write back to file
  fs.writeFileSync(envPath, content);
  console.log("\n✅ Essential mode enabled!");
  console.log(
    "\n⚠️  IMPORTANT: Restart your Next.js server for changes to take effect:"
  );
  console.log("   1. Stop the server (Ctrl+C)");
  console.log("   2. Run: npm run dev");
  console.log("\n📝 To verify after restart:");
  console.log("   - Visit http://localhost:3000/test-complete-flow");
  console.log(
    "   - Or http://localhost:3000/assessment (should now use essential questions)"
  );
} catch (error) {
  console.error("❌ Error enabling essential mode:", error.message);
  console.log("\n💡 Manual setup:");
  console.log("1. Create or edit .env.local in the project root");
  console.log("2. Add this line: NEXT_PUBLIC_ESSENTIAL_MODE=true");
  console.log("3. Restart your Next.js server");
}
