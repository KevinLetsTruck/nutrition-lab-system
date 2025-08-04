require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSimple() {
  console.log('🧪 Simple Document Versioning Test\n');
  
  try {
    // Test 1: Insert a document using returning
    console.log('1️⃣ Testing document insert...');
    
    const { data: insertResult, error: insertError } = await supabase
      .from('documents')
      .insert({
        client_id: '4a7b0731-91a8-48a4-8193-c2b691d7fbf8',
        document_name: 'simple-test.pdf',
        document_type: 'nutriq',
        metadata: {}
      })
      .select();
    
    console.log('Insert result:', { data: insertResult, error: insertError });
    
    if (insertError) {
      console.error('Insert error:', insertError);
      
      // Try to get more error details
      console.log('Error type:', typeof insertError);
      console.log('Error keys:', Object.keys(insertError));
      console.log('Error stringified:', JSON.stringify(insertError));
      console.log('Error toString:', insertError.toString());
      return;
    }
    
    if (!insertResult || insertResult.length === 0) {
      console.error('❌ No data returned from insert');
      return;
    }
    
    const insertedDoc = insertResult[0];
    console.log('✅ Document created!');
    console.log('Document ID:', insertedDoc.id);
    console.log('Document:', insertedDoc);
    
    // Test 2: Create a version
    console.log('\n2️⃣ Testing version creation...');
    
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: insertedDoc.id,
        extracted_data: { test: true },
        ocr_confidence: 0.95
      })
      .select()
      .single();
    
    if (versionError) {
      console.error('Version error:', versionError);
      return;
    }
    
    console.log('✅ Version created!');
    console.log('Version number:', version.version_number);
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await supabase.from('document_versions').delete().eq('document_id', insertedDoc.id);
    await supabase.from('documents').delete().eq('id', insertedDoc.id);
    
    console.log('✅ Test complete!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    console.error('Stack:', error.stack);
  }
}

testSimple();