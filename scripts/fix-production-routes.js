#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of routes that use pdf-parse and need to be production-safe
const problematicRoutes = [
  'src/app/api/pdf-advanced-extract/route.ts',
  'src/app/api/pdf-direct-to-claude/route.ts',
  'src/app/api/pdf-to-claude-vision/route.ts',
  'src/app/api/claude-pdf/route.ts',
  'src/app/api/analyze-simple/route.ts',
  'src/app/api/pdf-claude-binary/route.ts'
];

const productionCheckCode = `  // This endpoint is disabled in production due to pdf-parse dependency
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return NextResponse.json({ 
      error: 'This endpoint is not available in production. Please use /api/lab-reports/upload instead.',
      suggestion: 'The lab-reports/upload endpoint provides PDF processing with Claude native support.'
    }, { status: 503 })
  }
  
  // Original implementation only runs in development`;

problematicRoutes.forEach(routePath => {
  const fullPath = path.join(process.cwd(), routePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${routePath} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if already fixed
  if (content.includes('This endpoint is disabled in production')) {
    console.log(`✅ ${routePath} - already fixed`);
    return;
  }
  
  // Find the POST function and inject the check
  const postFunctionMatch = content.match(/export\s+async\s+function\s+POST\s*\([^)]*\)\s*\{/);
  
  if (postFunctionMatch) {
    const insertPosition = postFunctionMatch.index + postFunctionMatch[0].length;
    content = content.slice(0, insertPosition) + '\n' + productionCheckCode + '\n' + content.slice(insertPosition);
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ ${routePath} - fixed`);
  } else {
    console.log(`⚠️  ${routePath} - couldn't find POST function`);
  }
});

console.log('\n✅ Production route fixes complete!');
console.log('Note: Only /api/lab-reports/upload will work in production.');