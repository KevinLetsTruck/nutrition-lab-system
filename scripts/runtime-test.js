#!/usr/bin/env node

/**
 * Runtime Testing Script for DestinationHealth
 * Tests key functionality and collects metrics
 */

const http = require('http');
const https = require('https');

const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/assessments', name: 'Assessments' },
  { path: '/clients', name: 'Clients' },
  { path: '/reports', name: 'Reports' },
  { path: '/auth', name: 'Auth/Login' },
];

const TEST_PORT = 3000;
const TEST_HOST = 'localhost';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testPage(path) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: TEST_HOST,
      port: TEST_PORT,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'DestinationHealth-Runtime-Test/1.0',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const loadTime = Date.now() - startTime;
        const contentLength = data.length;
        
        // Check for common issues
        const hasTitle = data.includes('<title>');
        const hasDarkTheme = data.includes('class="dark"') || data.includes('dark');
        const hasGradientText = data.includes('gradient-text');
        const hasNoScriptErrors = !data.includes('Error:') && !data.includes('error:');
        
        resolve({
          path,
          statusCode: res.statusCode,
          loadTime,
          contentLength,
          hasTitle,
          hasDarkTheme,
          hasGradientText,
          hasNoScriptErrors,
          success: res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 302,
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        path,
        statusCode: 0,
        loadTime: Date.now() - startTime,
        error: error.message,
        success: false,
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path,
        statusCode: 0,
        loadTime: 5000,
        error: 'Timeout',
        success: false,
      });
    });
    
    req.end();
  });
}

async function runTests() {
  log('\n🚀 DestinationHealth Runtime Testing\n', 'cyan');
  log('=' .repeat(50), 'blue');
  
  // Check if server is running
  log('\n📡 Checking server status...', 'yellow');
  
  const serverCheck = await testPage('/');
  if (!serverCheck.success && serverCheck.statusCode === 0) {
    log('❌ Server is not running on http://localhost:3000', 'red');
    log('Please run: npm run dev', 'yellow');
    process.exit(1);
  }
  
  log('✅ Server is running!', 'green');
  
  // Test all pages
  log('\n📄 Testing pages...', 'yellow');
  log('-' .repeat(50), 'blue');
  
  const results = [];
  let totalLoadTime = 0;
  let successCount = 0;
  
  for (const page of PAGES_TO_TEST) {
    const result = await testPage(page.path);
    results.push({ ...result, name: page.name });
    
    if (result.success) {
      successCount++;
      totalLoadTime += result.loadTime;
      
      log(`✅ ${page.name} (${page.path})`, 'green');
      log(`   Status: ${result.statusCode} | Load time: ${result.loadTime}ms`, 'cyan');
      
      if (result.hasTitle && result.hasDarkTheme) {
        log(`   ✓ Has title | ✓ Dark theme applied`, 'green');
      }
      if (result.hasGradientText) {
        log(`   ✓ Gradient text found`, 'green');
      }
    } else {
      log(`❌ ${page.name} (${page.path})`, 'red');
      log(`   Error: ${result.error || `Status ${result.statusCode}`}`, 'red');
    }
  }
  
  // Summary
  log('\n📊 Test Summary', 'yellow');
  log('=' .repeat(50), 'blue');
  log(`Pages tested: ${results.length}`, 'cyan');
  log(`Successful: ${successCount}/${results.length}`, successCount === results.length ? 'green' : 'yellow');
  log(`Average load time: ${Math.round(totalLoadTime / successCount)}ms`, 'cyan');
  
  // Performance checks
  const slowPages = results.filter(r => r.loadTime > 3000);
  if (slowPages.length > 0) {
    log('\n⚠️  Slow pages (>3s):', 'yellow');
    slowPages.forEach(page => {
      log(`   - ${page.name}: ${page.loadTime}ms`, 'yellow');
    });
  }
  
  // Recommendations
  log('\n💡 Recommendations:', 'yellow');
  log('-' .repeat(50), 'blue');
  
  if (successCount < results.length) {
    log('1. Fix failing pages before production deployment', 'yellow');
  }
  
  if (totalLoadTime / successCount > 2000) {
    log('2. Optimize page load times (target <2s)', 'yellow');
  }
  
  log('3. Run browser-based tests for:', 'cyan');
  log('   - Visual regression testing', 'cyan');
  log('   - Responsive design validation', 'cyan');
  log('   - Accessibility compliance', 'cyan');
  log('   - Cross-browser compatibility', 'cyan');
  
  log('\n✨ Testing complete!\n', 'green');
  
  // Generate report data
  const reportData = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      totalPages: results.length,
      successfulPages: successCount,
      averageLoadTime: Math.round(totalLoadTime / successCount),
      recommendation: successCount === results.length ? 'PASS' : 'NEEDS_ATTENTION',
    },
  };
  
  // Save report
  require('fs').writeFileSync(
    'runtime-test-results.json',
    JSON.stringify(reportData, null, 2)
  );
  
  log('Report saved to: runtime-test-results.json', 'cyan');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});