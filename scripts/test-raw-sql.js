require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRawSQL() {
  console.log('🧪 Testing with raw SQL\n');
  
  try {
    // First, let's check if we can query at all
    console.log('1️⃣ Testing basic query...');
    const { data: testQuery, error: testError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    console.log('Basic query result:', { data: testQuery, error: testError });
    
    if (testError) {
      console.error('Basic query failed:', testError);
      return;
    }
    
    // Skip table structure check for now
    console.log('\n2️⃣ Skipping table structure check...');
    
    // Try a different insert syntax
    console.log('\n3️⃣ Testing insert with minimal data...');
    const minimalDoc = {
      client_id: '4a7b0731-91a8-48a4-8193-c2b691d7fbf8',
      document_name: 'minimal-test.pdf',
      document_type: 'test'
    };
    
    console.log('Attempting insert:', minimalDoc);
    
    // First try without select
    const insertResponse = await supabase
      .from('documents')
      .insert(minimalDoc);
    
    console.log('Insert response (no select):', insertResponse);
    
    // Now try to query for it
    if (!insertResponse.error || insertResponse.error.message === undefined) {
      console.log('\n4️⃣ Querying for inserted document...');
      const { data: foundDoc, error: findError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_name', 'minimal-test.pdf')
        .order('created_at', { ascending: false })
        .limit(1);
      
      console.log('Query result:', { data: foundDoc, error: findError });
      
      if (foundDoc && foundDoc.length > 0) {
        console.log('✅ Document was inserted successfully!');
        console.log('Document:', foundDoc[0]);
        
        // Cleanup
        await supabase
          .from('documents')
          .delete()
          .eq('id', foundDoc[0].id);
        
        console.log('🧹 Cleaned up test data');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    console.error('Stack:', error.stack);
  }
}

testRawSQL();