const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Patterns to find console statements
const consolePattern = /console\.(log|error|warn|info|debug|trace)\([^)]*\);?/g;

// Files to process
const srcPattern = "src/**/*.{ts,tsx,js,jsx}";
const libPattern = "lib/**/*.{ts,tsx,js,jsx}";

// Files to exclude (test files, scripts, etc)
const excludePatterns = [
  "**/node_modules/**",
  "**/*.test.*",
  "**/*.spec.*",
  "**/test/**",
  "**/tests/**",
  "**/scripts/**",
  "**/mcp-servers/**",
];

function removeConsoleLogs(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  
  // Keep console.error statements but remove others
  let newContent = content.replace(consolePattern, (match) => {
    if (match.includes("console.error")) {
      // Keep error logs for debugging production issues
      return match;
    }
    // Remove other console statements
    return "";
  });
  
  // Clean up empty lines that might be left
  newContent = newContent.replace(/^\s*\n/gm, "\n");
  newContent = newContent.replace(/\n\n\n+/g, "\n\n");
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  
  return false;
}

async function main() {
  console.log("🧹 Removing console.log statements from production code...\n");
  
  // Get all files to process
  const srcFiles = glob.sync(srcPattern, { ignore: excludePatterns });
  const libFiles = glob.sync(libPattern, { ignore: excludePatterns });
  const allFiles = [...srcFiles, ...libFiles];
  
  console.log(`Found ${allFiles.length} files to check\n`);
  
  let modifiedCount = 0;
  const modifiedFiles = [];
  
  for (const file of allFiles) {
    if (removeConsoleLogs(file)) {
      modifiedCount++;
      modifiedFiles.push(file);
    }
  }
  
  if (modifiedCount > 0) {
    console.log(`✅ Modified ${modifiedCount} files:`);
    modifiedFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log("✅ No console.log statements found to remove!");
  }
  
  console.log("\n💡 Note: console.error statements were preserved for production debugging");
}

main().catch(console.error);
