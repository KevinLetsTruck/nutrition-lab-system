#!/usr/bin/env node

/**
 * FNTP Assessment System - Health Check Script
 * 
 * Run this script to verify the system state and prevent duplicate work.
 * Usage: node checkpoint.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

const checkmark = colors.green + '✓' + colors.reset;
const cross = colors.red + '✗' + colors.reset;
const warning = colors.yellow + '⚠' + colors.reset;

async function runHealthCheck() {
  console.log('\n' + colors.bold + colors.blue + '═══════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bold + '     FNTP Assessment System - Health Check     ' + colors.reset);
  console.log(colors.blue + '═══════════════════════════════════════════════════════' + colors.reset + '\n');

  const results = {
    database: false,
    questions: false,
    files: false,
    api: false,
    total: 0,
    passed: 0
  };

  // 1. Check Database Connection
  console.log(colors.bold + '1. Database Connection' + colors.reset);
  try {
    await prisma.$connect();
    console.log(`   ${checkmark} Database connected successfully`);
    results.database = true;
    results.passed++;
  } catch (error) {
    console.log(`   ${cross} Database connection failed:`, error.message);
  }
  results.total++;

  // 2. Check Assessment Templates
  console.log('\n' + colors.bold + '2. Assessment Templates' + colors.reset);
  try {
    const templates = await prisma.assessmentTemplate.findMany({
      select: {
        id: true,
        name: true,
        version: true,
        isActive: true
      }
    });

    if (templates.length > 0) {
      console.log(`   ${checkmark} Found ${templates.length} template(s):`);
      
      for (const template of templates) {
        // Get question count
        const fullTemplate = await prisma.assessmentTemplate.findUnique({
          where: { id: template.id }
        });
        
        let questionCount = 0;
        if (fullTemplate?.questionBank) {
          if (Array.isArray(fullTemplate.questionBank)) {
            questionCount = fullTemplate.questionBank.length;
          } else {
            questionCount = Object.keys(fullTemplate.questionBank).length;
          }
        }
        
        const status = questionCount > 400 ? checkmark : 
                       questionCount > 100 ? warning : cross;
        
        console.log(`      ${status} ${template.id}: v${template.version} - ${questionCount} questions`);
        
        if (questionCount >= 400) {
          results.questions = true;
          results.passed++;
        }
      }
    } else {
      console.log(`   ${cross} No assessment templates found`);
    }
  } catch (error) {
    console.log(`   ${cross} Error checking templates:`, error.message);
  }
  results.total++;

  // 3. Check Question Files
  console.log('\n' + colors.bold + '3. Question Files' + colors.reset);
  const questionDir = path.join(process.cwd(), 'lib/assessment/questions');
  try {
    if (fs.existsSync(questionDir)) {
      const files = fs.readdirSync(questionDir).filter(f => f.endsWith('.ts'));
      console.log(`   ${checkmark} Found ${files.length} TypeScript question files`);
      
      // Check for index.ts
      const indexPath = path.join(questionDir, 'index.ts');
      if (fs.existsSync(indexPath)) {
        console.log(`   ${checkmark} index.ts exports found`);
        results.files = true;
        results.passed++;
      } else {
        console.log(`   ${cross} index.ts not found`);
      }
    } else {
      console.log(`   ${cross} Question directory not found`);
    }
  } catch (error) {
    console.log(`   ${cross} Error checking files:`, error.message);
  }
  results.total++;

  // 4. Check API Endpoints
  console.log('\n' + colors.bold + '4. API Endpoints' + colors.reset);
  const apiDir = path.join(process.cwd(), 'app/api/assessment');
  try {
    if (fs.existsSync(apiDir)) {
      const endpoints = fs.readdirSync(apiDir);
      console.log(`   ${checkmark} Found ${endpoints.length} API endpoint(s)`);
      
      // Check for specific important endpoints
      const requiredEndpoints = ['test', 'start'];
      for (const endpoint of requiredEndpoints) {
        const endpointPath = path.join(apiDir, endpoint);
        if (fs.existsSync(endpointPath)) {
          console.log(`      ${checkmark} /${endpoint} endpoint exists`);
        } else {
          console.log(`      ${warning} /${endpoint} endpoint missing`);
        }
      }
      results.api = true;
      results.passed++;
    } else {
      console.log(`   ${cross} API directory not found`);
    }
  } catch (error) {
    console.log(`   ${cross} Error checking APIs:`, error.message);
  }
  results.total++;

  // 5. Check Client Assessments
  console.log('\n' + colors.bold + '5. Client Assessments' + colors.reset);
  try {
    const clientAssessments = await prisma.clientAssessment.count();
    if (clientAssessments > 0) {
      console.log(`   ${warning} Found ${clientAssessments} existing client assessment(s)`);
      console.log(`      Note: Cannot delete templates while client data exists`);
    } else {
      console.log(`   ${checkmark} No client assessments (safe to modify templates)`);
    }
  } catch (error) {
    console.log(`   ${cross} Error checking client assessments:`, error.message);
  }

  // 6. Check Status Files
  console.log('\n' + colors.bold + '6. Documentation & Status Files' + colors.reset);
  const statusFiles = ['MASTER_STATUS.md', 'STATUS_AUDIT.md'];
  for (const file of statusFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const lastModified = new Date(stats.mtime).toLocaleString();
      console.log(`   ${checkmark} ${file} (updated: ${lastModified})`);
    } else {
      console.log(`   ${warning} ${file} not found`);
    }
  }

  // Summary
  console.log('\n' + colors.blue + '═══════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bold + '                    SUMMARY                    ' + colors.reset);
  console.log(colors.blue + '═══════════════════════════════════════════════════════' + colors.reset);
  
  const percentage = Math.round((results.passed / results.total) * 100);
  const statusColor = percentage >= 75 ? colors.green : 
                     percentage >= 50 ? colors.yellow : 
                     colors.red;
  
  console.log(`\n   Overall Health: ${statusColor}${percentage}%${colors.reset} (${results.passed}/${results.total} checks passed)`);
  
  if (results.questions && results.database) {
    console.log(`\n   ${checkmark} ${colors.green}System is ready for assessment testing!${colors.reset}`);
  } else if (!results.questions) {
    console.log(`\n   ${cross} ${colors.red}Questions not loaded in database. Run: npx tsx update-template.ts${colors.reset}`);
  } else if (!results.database) {
    console.log(`\n   ${cross} ${colors.red}Database connection issue. Check PostgreSQL is running.${colors.reset}`);
  }

  console.log('\n' + colors.bold + 'Next Steps:' + colors.reset);
  console.log('   1. Test interface: http://localhost:3000/test-simple');
  console.log('   2. View database: npx prisma studio');
  console.log('   3. Check status: cat MASTER_STATUS.md');
  console.log('   4. Run tests: npm run test');
  
  console.log('\n' + colors.blue + '═══════════════════════════════════════════════════════' + colors.reset + '\n');

  await prisma.$disconnect();
  process.exit(percentage >= 75 ? 0 : 1);
}

// Run the health check
runHealthCheck().catch((error) => {
  console.error(colors.red + 'Health check failed:', error.message + colors.reset);
  process.exit(1);
});
