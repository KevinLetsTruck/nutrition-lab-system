import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The Anthropic API key you want to add
const ANTHROPIC_KEY = process.argv[2];

if (!ANTHROPIC_KEY) {
  console.log("Please provide the Anthropic API key as an argument:");
  console.log("node scripts/add-anthropic-key.js your-api-key-here");
  process.exit(1);
}

const envPath = path.join(__dirname, "..", ".env.local");

try {
  // Read existing content
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  }

  // Check if key already exists
  if (content.includes("ANTHROPIC_API_KEY=")) {
    // Replace existing key
    content = content.replace(
      /ANTHROPIC_API_KEY=.*/,
      `ANTHROPIC_API_KEY=${ANTHROPIC_KEY}`
    );
    console.log("✅ Updated existing ANTHROPIC_API_KEY");
  } else {
    // Add new key
    content += `\n# Claude AI API Key\nANTHROPIC_API_KEY=${ANTHROPIC_KEY}\n`;
    console.log("✅ Added ANTHROPIC_API_KEY to .env.local");
  }

  // Write back
  fs.writeFileSync(envPath, content);
  console.log("\n🎉 Successfully configured Anthropic API key!");
  console.log("You can now test the AI analysis.");
} catch (error) {
  console.error("❌ Error updating .env.local:", error);
}
