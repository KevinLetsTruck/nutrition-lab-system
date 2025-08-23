import { getAllQuestions, getQuestionsByModule } from './lib/assessment/questions';
import { AssessmentOrchestrator } from './lib/ai/assessment-orchestrator';
import { PrismaClient } from '@prisma/client';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

console.log(`${colors.yellow}=== Assessment System Health Check ===${colors.reset}\n`);

async function checkQuestions() {
  console.log(`${colors.blue}Checking question bank...${colors.reset}`);
  try {
    const questions = getAllQuestions();
    console.log(`${colors.green}✓ Question bank loaded${colors.reset}`);
    console.log(`  Total questions: ${questions.length}`);
    
    // Count by module
    const modules: Record<string, number> = {};
    questions.forEach(q => {
      modules[q.module] = (modules[q.module] || 0) + 1;
    });
    
    console.log(`\n  Questions by module:`);
    Object.entries(modules).forEach(([module, count]) => {
      const target = getTargetForModule(module);
      const percentage = Math.round((count / target) * 100);
      const status = percentage >= 100 ? colors.green : percentage >= 60 ? colors.yellow : colors.red;
      console.log(`    ${module}: ${count}/${target} ${status}(${percentage}%)${colors.reset}`);
    });
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Could not load questions${colors.reset}`);
    console.log(`  Error: ${(error as Error).message}`);
    return false;
  }
}

function getTargetForModule(module: string): number {
  const targets: Record<string, number> = {
    SCREENING: 75,
    ASSIMILATION: 65,
    DEFENSE_REPAIR: 60,
    ENERGY: 70,
    BIOTRANSFORMATION: 55,
    TRANSPORT: 50,
    COMMUNICATION: 75,
    STRUCTURAL: 45
  };
  return targets[module] || 50;
}

async function checkDatabase() {
  console.log(`\n${colors.blue}Checking database...${colors.reset}`);
  const prisma = new PrismaClient();
  
  try {
    const assessmentCount = await prisma.clientAssessment.count();
    const responseCount = await prisma.clientResponse.count();
    
    console.log(`${colors.green}✓ Database connected${colors.reset}`);
    console.log(`  Assessments: ${assessmentCount}`);
    console.log(`  Responses: ${responseCount}`);
    
    // Check for recent activity
    const recentAssessment = await prisma.clientAssessment.findFirst({
      orderBy: { updatedAt: 'desc' },
      include: {
        responses: {
          take: 1
        }
      }
    });
    
    if (recentAssessment) {
      console.log(`  Last activity: ${recentAssessment.updatedAt.toLocaleString()}`);
      console.log(`  Status: ${recentAssessment.status}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Database error${colors.reset}`);
    console.log(`  Error: ${(error as Error).message}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function checkOrchestrator() {
  console.log(`\n${colors.blue}Checking AI Orchestrator...${colors.reset}`);
  
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.log(`${colors.yellow}⚠ ANTHROPIC_API_KEY not set${colors.reset}`);
      console.log(`  AI features will not work without API key`);
      return false;
    }
    
    const orchestrator = new AssessmentOrchestrator({
      anthropicApiKey: apiKey
    });
    
    console.log(`${colors.green}✓ AI Orchestrator initialized${colors.reset}`);
    console.log(`  Patterns: ${orchestrator.patterns.length}`);
    console.log(`  API Key: ${apiKey.substring(0, 10)}...`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ AI Orchestrator error${colors.reset}`);
    console.log(`  Error: ${(error as Error).message}`);
    return false;
  }
}

async function checkServer() {
  console.log(`${colors.blue}Checking server...${colors.reset}`);
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log(`${colors.green}✓ Server is running on port 3000${colors.reset}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`${colors.red}✗ Server not responding${colors.reset}`);
    console.log(`  Run: npm run dev`);
    return false;
  }
}

async function main() {
  const results = [];
  
  results.push(await checkServer());
  results.push(await checkQuestions());
  results.push(await checkDatabase());
  results.push(await checkOrchestrator());
  
  console.log(`\n${colors.yellow}=== Summary ===${colors.reset}`);
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log(`${colors.green}✅ All ${total} checks passed!${colors.reset}`);
    console.log(`\nSystem is ready for testing.`);
  } else {
    console.log(`${colors.yellow}⚠ ${passed}/${total} checks passed${colors.reset}`);
  }
  
  console.log(`\n${colors.blue}Next steps:${colors.reset}`);
  console.log(`1. Visit http://localhost:3000 to test the UI`);
  console.log(`2. Create a test assessment`);
  console.log(`3. Monitor the AI decisions in the console`);
  
  process.exit(passed === total ? 0 : 1);
}

main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
