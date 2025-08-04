require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDirectInsert() {
  console.log('🧪 Testing Direct Document Insert\n');
  
  // Initialize test document
  const testDocument = {
    client_id: '4a7b0731-91a8-48a4-8193-c2b691d7fbf8',
    document_name: 'test-direct.pdf',
    document_type: 'nutriq',
    original_filename: 'test-direct.pdf',
    metadata: { test: true },
    is_active: true
  };
  
  // First verify the client exists
  console.log('0️⃣ Verifying client exists...');
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, first_name, last_name')
    .eq('id', testDocument.client_id)
    .single();
  
  if (clientError || !client) {
    console.error('❌ Client not found:', clientError);
    console.log('Getting first available client...');
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name')
      .limit(1)
      .single();
    
    if (clientsError || !clients) {
      console.error('❌ No clients found:', clientsError);
      return;
    }
    
    console.log('Using client:', clients.id, clients.first_name, clients.last_name);
    testDocument.client_id = clients.id;
  } else {
    console.log('✅ Client found:', client.first_name, client.last_name);
  }
  
  // Test 1: Direct insert into documents table
  console.log('\n1️⃣ Testing direct insert into documents table...');
  
  console.log('Inserting:', testDocument);
  
  // First try insert without select
  const { error: insertError } = await supabase
    .from('documents')
    .insert(testDocument);
  
  if (insertError) {
    console.error('❌ Insert error:', insertError);
    return;
  }
  
  console.log('✅ Insert successful, now querying...');
  
  // Now query to get the inserted document
  const { data: docData, error: queryError } = await supabase
    .from('documents')
    .select('*')
    .eq('document_name', testDocument.document_name)
    .eq('client_id', testDocument.client_id)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (queryError) {
    console.error('❌ Query error:', queryError);
    return;
  }
  
  if (!docData || docData.length === 0) {
    console.error('❌ No document found after insert');
    return;
  }
  
  const document = docData[0];
  console.log('✅ Document created:', document.id);
  
  // Test 2: Insert version
  console.log('\n2️⃣ Testing direct insert into document_versions table...');
  
  const testVersion = {
    document_id: document.id,
    extracted_data: {
      rawText: 'Test content',
      score: 45
    },
    ocr_confidence: 0.95,
    processing_method: 'test'
  };
  
  console.log('Inserting version:', testVersion);
  
  const { data: versionData, error: versionError } = await supabase
    .from('document_versions')
    .insert(testVersion)
    .select()
    .single();
  
  if (versionError) {
    console.error('❌ Version insert error:', versionError);
  } else {
    console.log('✅ Version created:', versionData.version_number);
  }
  
  // Test 3: Query to verify
  console.log('\n3️⃣ Verifying data...');
  
  const { data: docs, error: verifyError } = await supabase
    .from('documents')
    .select(`
      *,
      document_versions (*)
    `)
    .eq('id', document.id)
    .single();
  
  if (verifyError) {
    console.error('❌ Query error:', verifyError);
  } else {
    console.log('✅ Document with versions:', JSON.stringify(docs, null, 2));
  }
  
  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  await supabase.from('document_versions').delete().eq('document_id', document.id);
  await supabase.from('documents').delete().eq('id', document.id);
  
  console.log('✅ Test complete!');
}

testDirectInsert().catch(console.error);