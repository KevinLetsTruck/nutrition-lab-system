const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndCreateTables() {
  console.log('Checking database tables...')

  try {
    // Check if clients table exists
    const { data: clientsCheck, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .limit(1)

    if (clientsError) {
      console.log('Creating clients table...')
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS clients (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active',
            archived_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      if (error) {
        console.error('Error creating clients table:', error)
      } else {
        console.log('✅ Clients table created')
      }
    } else {
      console.log('✅ Clients table exists')
    }

    // Check if protocols table exists
    const { data: protocolsCheck, error: protocolsError } = await supabase
      .from('protocols')
      .select('count')
      .limit(1)

    if (protocolsError) {
      console.log('Creating protocols table...')
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS protocols (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
            phase VARCHAR(255) NOT NULL,
            content TEXT,
            status VARCHAR(20) DEFAULT 'draft',
            start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      if (error) {
        console.error('Error creating protocols table:', error)
      } else {
        console.log('✅ Protocols table created')
      }
    } else {
      console.log('✅ Protocols table exists')
    }

    // Check if client_notes table exists
    const { data: notesCheck, error: notesError } = await supabase
      .from('client_notes')
      .select('count')
      .limit(1)

    if (notesError) {
      console.log('Creating client_notes table...')
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS client_notes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            author VARCHAR(255) DEFAULT 'Kevin Rutherford, FNTP',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      if (error) {
        console.error('Error creating client_notes table:', error)
      } else {
        console.log('✅ Client notes table created')
      }
    } else {
      console.log('✅ Client notes table exists')
    }

    // Check if lab_reports table exists
    const { data: reportsCheck, error: reportsError } = await supabase
      .from('lab_reports')
      .select('count')
      .limit(1)

    if (reportsError) {
      console.log('Creating lab_reports table...')
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS lab_reports (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
            report_type VARCHAR(50) NOT NULL,
            file_path TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            analysis_results JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      if (error) {
        console.error('Error creating lab_reports table:', error)
      } else {
        console.log('✅ Lab reports table created')
      }
    } else {
      console.log('✅ Lab reports table exists')
    }

    // Add some test data if tables are empty
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .limit(1)

    if (!existingClients || existingClients.length === 0) {
      console.log('Adding test clients...')
      const { error } = await supabase
        .from('clients')
        .insert([
          {
            id: '1',
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@example.com',
            phone: '(555) 123-4567',
            status: 'active'
          },
          {
            id: '2',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@example.com',
            phone: '(555) 234-5678',
            status: 'active'
          },
          {
            id: '3',
            first_name: 'Mike',
            last_name: 'Wilson',
            email: 'mike.wilson@example.com',
            phone: '(555) 345-6789',
            status: 'active'
          }
        ])

      if (error) {
        console.error('Error adding test clients:', error)
      } else {
        console.log('✅ Test clients added')
      }
    }

    console.log('Database setup complete!')

  } catch (error) {
    console.error('Error checking database:', error)
  }
}

checkAndCreateTables() 