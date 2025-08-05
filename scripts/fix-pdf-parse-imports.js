#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of routes that use pdf-parse
const problematicRoutes = [
  'src/app/api/pdf-advanced-extract/route.ts',
  'src/app/api/pdf-direct-to-claude/route.ts',
  'src/app/api/pdf-to-claude-vision/route.ts',
  'src/app/api/claude-pdf/route.ts',
  'src/app/api/analyze-simple/route.ts',
  'src/app/api/pdf-claude-binary/route.ts'
];

problematicRoutes.forEach(routePath => {
  const fullPath = path.join(process.cwd(), routePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${routePath} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Fix pdf-parse imports
  content = content.replace(
    /await import\('pdf-parse'\)/g,
    "await import('pdf-parse' as any)"
  );
  
  // Also fix any direct imports
  content = content.replace(
    /import pdfParse from 'pdf-parse'/g,
    "// @ts-ignore\nimport pdfParse from 'pdf-parse'"
  );
  
  // Fix the specific case where it's already assigned
  content = content.replace(
    /const pdfParse = \(await import\('pdf-parse'\)\)\.default/g,
    "const pdfParse = (await import('pdf-parse' as any)).default"
  );
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${routePath} - fixed imports`);
});

console.log('\n✅ PDF-parse import fixes complete!');