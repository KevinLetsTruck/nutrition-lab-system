#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route.ts files in directories with brackets (dynamic routes)
const routeFiles = glob.sync('src/app/api/**/\\[*\\]/**/route.ts', {
  cwd: '/Users/kr/fntp-nutrition-system'
});

console.log(`Found ${routeFiles.length} route files to fix`);

let fixedCount = 0;
let errorCount = 0;

routeFiles.forEach(file => {
  const fullPath = path.join('/Users/kr/fntp-nutrition-system', file);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Fix GET handlers
    if (content.includes('export async function GET(')) {
      const getRegex = /export async function GET\s*\(\s*request[^,]*,\s*{\s*params\s*}\s*:\s*{\s*params:\s*{[^}]+}\s*}\s*\)/g;
      const newContent = content.replace(getRegex, (match) => {
        // Extract the params type
        const paramsMatch = match.match(/params:\s*({[^}]+})/);
        if (paramsMatch) {
          const paramsType = paramsMatch[1];
          return match.replace(
            `{ params }: { params: ${paramsType} }`,
            `{ params }: { params: Promise<${paramsType}> }`
          );
        }
        return match;
      });
      
      if (newContent !== content) {
        // Also add await for params
        content = newContent.replace(
          /const\s+{\s*([^}]+)\s*}\s*=\s*params;/g,
          'const { $1 } = await params;'
        );
        modified = true;
      }
    }
    
    // Fix POST handlers
    if (content.includes('export async function POST(')) {
      const postRegex = /export async function POST\s*\(\s*request[^,]*,\s*{\s*params\s*}\s*:\s*{\s*params:\s*{[^}]+}\s*}\s*\)/g;
      const newContent = content.replace(postRegex, (match) => {
        const paramsMatch = match.match(/params:\s*({[^}]+})/);
        if (paramsMatch) {
          const paramsType = paramsMatch[1];
          return match.replace(
            `{ params }: { params: ${paramsType} }`,
            `{ params }: { params: Promise<${paramsType}> }`
          );
        }
        return match;
      });
      
      if (newContent !== content) {
        content = newContent.replace(
          /const\s+{\s*([^}]+)\s*}\s*=\s*params;/g,
          'const { $1 } = await params;'
        );
        modified = true;
      }
    }
    
    // Fix PATCH handlers
    if (content.includes('export async function PATCH(')) {
      const patchRegex = /export async function PATCH\s*\(\s*request[^,]*,\s*{\s*params\s*}\s*:\s*{\s*params:\s*{[^}]+}\s*}\s*\)/g;
      const newContent = content.replace(patchRegex, (match) => {
        const paramsMatch = match.match(/params:\s*({[^}]+})/);
        if (paramsMatch) {
          const paramsType = paramsMatch[1];
          return match.replace(
            `{ params }: { params: ${paramsType} }`,
            `{ params }: { params: Promise<${paramsType}> }`
          );
        }
        return match;
      });
      
      if (newContent !== content) {
        content = newContent.replace(
          /const\s+{\s*([^}]+)\s*}\s*=\s*params;/g,
          'const { $1 } = await params;'
        );
        modified = true;
      }
    }
    
    // Fix DELETE handlers
    if (content.includes('export async function DELETE(')) {
      const deleteRegex = /export async function DELETE\s*\(\s*request[^,]*,\s*{\s*params\s*}\s*:\s*{\s*params:\s*{[^}]+}\s*}\s*\)/g;
      const newContent = content.replace(deleteRegex, (match) => {
        const paramsMatch = match.match(/params:\s*({[^}]+})/);
        if (paramsMatch) {
          const paramsType = paramsMatch[1];
          return match.replace(
            `{ params }: { params: ${paramsType} }`,
            `{ params }: { params: Promise<${paramsType}> }`
          );
        }
        return match;
      });
      
      if (newContent !== content) {
        content = newContent.replace(
          /const\s+{\s*([^}]+)\s*}\s*=\s*params;/g,
          'const { $1 } = await params;'
        );
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    } else {
      console.log(`⏭️  Skipped (already fixed or no dynamic params): ${file}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Fixed: ${fixedCount} files`);
console.log(`   Errors: ${errorCount} files`);
console.log(`   Total: ${routeFiles.length} files`);
