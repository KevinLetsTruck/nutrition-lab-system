import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running AI Conversations migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'database', 'migrations', '010_ai_conversations.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      
      // If exec_sql doesn't exist, try direct execution
      if (error.message?.includes('function') || error.message?.includes('does not exist')) {
        console.log('Trying alternative migration method...');
        
        // Split the SQL into individual statements
        const statements = migrationSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        for (const statement of statements) {
          console.log('Executing:', statement.substring(0, 50) + '...');
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (stmtError) {
            console.error('Statement failed:', stmtError);
            throw stmtError;
          }
        }
      } else {
        throw error;
      }
    }
    
    console.log('✅ AI Conversations migration completed successfully!');
    
    // Verify tables were created
    const { data: tables, error: verifyError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['ai_conversations', 'conversation_messages', 'conversation_analysis']);
    
    if (verifyError) {
      console.log('Could not verify tables (this is normal)');
    } else {
      console.log('Created tables:', tables?.map(t => t.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();