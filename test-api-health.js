#!/usr/bin/env node

const API_BASE = 'http://localhost:3000';

async function checkHealth() {
  console.log('Checking API health...');
  
  try {
    // Try to fetch the homepage
    console.log(`\nFetching ${API_BASE}/...`);
    const homeResponse = await fetch(API_BASE);
    console.log(`Homepage status: ${homeResponse.status}`);
    
    // Try the API health endpoint
    console.log(`\nFetching ${API_BASE}/api/health...`);
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthContentType = healthResponse.headers.get('content-type');
    console.log(`Health endpoint status: ${healthResponse.status}`);
    console.log(`Health endpoint content-type: ${healthContentType}`);
    
    if (healthContentType && healthContentType.includes('application/json')) {
      const healthData = await healthResponse.json();
      console.log('Health data:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('Health endpoint not returning JSON');
    }
    
    // Try the assessment endpoints
    console.log(`\nFetching ${API_BASE}/api/assessment...`);
    const assessmentResponse = await fetch(`${API_BASE}/api/assessment`);
    console.log(`Assessment endpoint status: ${assessmentResponse.status}`);
    
    // List available API routes
    console.log('\nChecking available API routes...');
    const routes = [
      '/api/assessment/start',
      '/api/assessment/templates',
      '/api/assessment/seed',
      '/api/auth/login',
      '/api/medical/documents',
      '/api/clients'
    ];
    
    for (const route of routes) {
      const response = await fetch(`${API_BASE}${route}`);
      console.log(`  ${route}: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Error checking API:', error.message);
    console.error('\nIs the development server running?');
    console.error('Run: npm run dev');
  }
}

checkHealth();
