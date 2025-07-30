require('dotenv').config({ path: '.env.local' });

async function testSimpleUpload() {
  console.log('=== Testing Simple Upload ===\n');
  
  try {
    // Create a simple FormData with just text
    const formData = new FormData();
    formData.append('clientEmail', 'john.smith@email.com');
    formData.append('clientFirstName', 'John');
    formData.append('clientLastName', 'Smith');
    formData.append('category', 'client_documents');
    
    // Create a simple PDF file (minimal PDF content)
    const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
    const file = new File([pdfContent], 'test.pdf', { type: 'application/pdf' });
    formData.append('file', file);
    
    console.log('FormData created with:');
    console.log('- clientEmail: john.smith@email.com');
    console.log('- clientFirstName: John');
    console.log('- clientLastName: Smith');
    console.log('- category: client_documents');
    console.log('- file: test.pdf (application/pdf)');
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const uploadUrl = `${baseUrl}/api/upload`;
    
    console.log(`\nMaking request to: ${uploadUrl}`);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    console.log(`Response status: ${response.status}`);
    
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
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testSimpleUpload(); 