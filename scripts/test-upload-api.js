require('dotenv').config({ path: '.env.local' });
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUploadAPI() {
  console.log('=== Testing Upload API Endpoint ===\n');
  
  try {
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload');
    
    // Create FormData like the client does
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('clientEmail', 'john.smith@email.com');
    formData.append('clientFirstName', 'John');
    formData.append('clientLastName', 'Smith');
    formData.append('category', 'client_documents');
    
    console.log('FormData contents:');
    console.log('- clientEmail: john.smith@email.com');
    console.log('- clientFirstName: John');
    console.log('- clientLastName: Smith');
    console.log('- category: client_documents');
    console.log('- file: test-upload.txt');
    
    // Make the API call
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const uploadUrl = `${baseUrl}/api/upload`;
    
    console.log(`\nMaking request to: ${uploadUrl}`);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`Response body: ${responseText}`);
    
    if (!response.ok) {
      console.log('\n❌ Upload failed with status:', response.status);
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    } else {
      console.log('\n✅ Upload successful!');
      try {
        const successData = JSON.parse(responseText);
        console.log('Success details:', successData);
      } catch (e) {
        console.log('Raw success response:', responseText);
      }
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testUploadAPI(); 