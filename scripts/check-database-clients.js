const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

console.log('Environment check:');
console.log('- Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('- Supabase Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\nError: Missing environment variables');
  console.log('\nPlease make sure you have a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('\n📊 Checking database...\n');
  
  // List clients
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, first_name, last_name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (clientsError) {
    console.error('Error fetching clients:', clientsError);
  } else {
    console.log(`Found ${clients?.length || 0} clients:`);
    if (clients && clients.length > 0) {
      clients.forEach((client, index) => {
        console.log(`\n${index + 1}. ${client.first_name} ${client.last_name}`);
        console.log(`   ID: ${client.id}`);
        console.log(`   Created: ${new Date(client.created_at).toLocaleDateString()}`);
      });
      
      console.log('\n✅ To use structured assessment, navigate to:');
      console.log(`   /assessments/structured/${clients[0].id}`);
    } else {
      console.log('\n⚠️  No clients found in database');
      console.log('\nTo create a client:');
      console.log('1. Go to /admin/quick-add-client');
      console.log('2. Or use the "Add Client" button in the app');
    }
  }
  
  // Check ai_conversations table
  const { data: assessments, error: assessmentsError } = await supabase
    .from('ai_conversations')
    .select('id, client_id, conversation_type, status')
    .eq('conversation_type', 'structured_assessment')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (!assessmentsError && assessments && assessments.length > 0) {
    console.log(`\n📝 Found ${assessments.length} existing structured assessments`);
  }
}

checkDatabase().catch(console.error);