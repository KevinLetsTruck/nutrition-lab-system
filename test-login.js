#!/usr/bin/env node

/**
 * Login Helper
 * Gets a valid session cookie for testing
 */

async function login(email, password) {
  console.log('\n=== Logging in ===\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('User:', data.user?.email);
      
      // Get the cookie from response headers
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const sessionCookie = setCookie.split(';')[0];
        console.log('\n📋 Session Cookie:');
        console.log(sessionCookie);
        console.log('\n📝 Copy this cookie and update test-assessment-comprehensive.js');
        return sessionCookie;
      } else {
        console.log('\n⚠️ No cookie in response. Check if sessions are configured correctly.');
      }
    } else {
      console.log('❌ Login failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test credentials - update these with your actual credentials
const EMAIL = 'kris@nutrientstation.com';
const PASSWORD = 'your_password_here';

console.log('Attempting to login with:', EMAIL);
console.log('Note: Update the PASSWORD variable in this file first!\n');

login(EMAIL, PASSWORD);
