#!/usr/bin/env node

/**
 * Test script for document upload and analysis
 * This helps diagnose issues with AWS Textract and document processing
 */

import 'dotenv/config';
import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';
import fs from 'fs/promises';
import path from 'path';

async function runTests() {
  console.log('🔍 Document Upload Test Script\n');
  console.log('=================================\n');

// Test 1: Check Environment Variables
console.log('1️⃣ Checking Environment Variables:');
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY'
];

let missingVars = [];
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`   ❌ ${varName}: NOT SET`);
    missingVars.push(varName);
  } else {
    const displayValue = varName.includes('KEY') || varName.includes('SECRET') 
      ? value.substring(0, 4) + '...' + value.substring(value.length - 4) 
      : value;
    console.log(`   ✅ ${varName}: ${displayValue}`);
  }
});

if (missingVars.length > 0) {
  console.log('\n⚠️  Missing environment variables:', missingVars.join(', '));
  console.log('\n📝 To fix this:');
  console.log('   1. Create a .env.local file in the project root');
  console.log('   2. Add the missing variables:');
  missingVars.forEach(varName => {
    console.log(`      ${varName}=your_value_here`);
  });
}

console.log('\n=================================\n');

// Test 2: Test AWS Textract Connection
console.log('2️⃣ Testing AWS Textract Connection:');
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  try {
    const client = new TextractClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    console.log('   ✅ AWS Textract client created successfully');
    console.log(`   📍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    
    // Try to analyze a simple test document
    const testText = Buffer.from('TEST DOCUMENT\nThis is a test.');
    const command = new AnalyzeDocumentCommand({
      Document: {
        Bytes: new Uint8Array(testText)
      },
      FeatureTypes: ['TABLES', 'FORMS']
    });
    
    console.log('   🔄 Sending test document to Textract...');
    const response = await client.send(command);
    console.log(`   ✅ Textract responded successfully! Blocks found: ${response.Blocks?.length || 0}`);
    
  } catch (error: any) {
    console.log('   ❌ AWS Textract connection failed:', error.message);
    if (error.message.includes('credentials')) {
      console.log('   💡 Check that your AWS credentials are valid');
    }
    if (error.message.includes('region')) {
      console.log('   💡 Try setting AWS_REGION=us-east-1');
    }
  }
} else {
  console.log('   ⚠️  Skipping Textract test - AWS credentials not configured');
}

console.log('\n=================================\n');

// Test 3: Check File System and Sample PDFs
console.log('3️⃣ Checking File System:');
const samplePdfPath = path.join(process.cwd(), 'test-files', 'sample-nutriq.pdf');
try {
  await fs.access(samplePdfPath);
  console.log('   ✅ Sample PDF found at:', samplePdfPath);
} catch {
  console.log('   ℹ️  No sample PDF found. Creating test-files directory...');
  await fs.mkdir(path.join(process.cwd(), 'test-files'), { recursive: true });
  console.log('   ✅ Created test-files directory');
  console.log('   📝 Place a sample PDF in ./test-files/sample-nutriq.pdf for testing');
}

console.log('\n=================================\n');

// Test 4: Provide Setup Instructions
console.log('4️⃣ Setup Instructions:');
console.log('\n📋 To fix document upload issues:\n');

if (missingVars.includes('AWS_ACCESS_KEY_ID') || missingVars.includes('AWS_SECRET_ACCESS_KEY')) {
  console.log('1. Set up AWS credentials:');
  console.log('   a. Log in to AWS Console');
  console.log('   b. Go to IAM → Users → Add User');
  console.log('   c. Create a user with programmatic access');
  console.log('   d. Attach policy: AmazonTextractFullAccess');
  console.log('   e. Save the Access Key ID and Secret Access Key');
  console.log('   f. Add to .env.local:\n');
  console.log('      AWS_ACCESS_KEY_ID=your_access_key');
  console.log('      AWS_SECRET_ACCESS_KEY=your_secret_key');
  console.log('      AWS_REGION=us-east-1\n');
}

console.log('2. Alternative: Use fallback PDF processing without Textract');
console.log('   - The system will automatically fall back to pdf-parse');
console.log('   - This works for text-based PDFs but not scanned images\n');

console.log('3. Test with a simple text-based PDF first');
console.log('   - Avoid large or complex PDFs initially');
console.log('   - Check browser console for errors\n');

console.log('=================================\n');
console.log('✨ Test complete!\n');
}

// Run the tests
runTests().catch(console.error);