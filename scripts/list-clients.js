import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listClients() {
  console.log('📋 Listing all clients in the database...\n');

  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    if (!clients || clients.length === 0) {
      console.log('❌ No clients found in the database');
      console.log('\nYou need to create some clients first!');
      return;
    }

    console.log(`Found ${clients.length} client(s):\n`);
    clients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.first_name} ${client.last_name}`);
      console.log(`   ID: ${client.id}`);
      console.log(`   Created: ${new Date(client.created_at).toLocaleDateString()}\n`);
    });

    console.log('\n💡 To test the AI conversation:');
    console.log(`1. Go to: /client/${clients[0].id}`);
    console.log('2. Click "Start AI Assessment"');

  } catch (error) {
    console.error('Error:', error);
  }
}

listClients();